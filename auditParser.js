// PDF Audit Parser for Biology Major Course Planner

// Set up PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Parse a degree audit PDF file
async function parseAuditPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Collect all text items and horizontal lines across all pages
    let allTextItems = [];
    let allHorizontalLines = [];
    let pageOffset = 0; // Cumulative Y offset for multi-page documents

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        const pageHeight = viewport.height;
        const pageWidth = viewport.width;

        if (i === 1) {
            console.log(`Page 1 dimensions: ${pageWidth.toFixed(1)} x ${pageHeight.toFixed(1)} units`);
        }

        // Extract text content
        const textContent = await page.getTextContent();
        textContent.items.forEach(item => {
            // Convert PDF coordinates (origin at bottom-left) to top-down coordinates
            const yFromTop = pageHeight - item.transform[5];
            allTextItems.push({
                str: item.str,
                x: item.transform[4],
                y: yFromTop + pageOffset,  // Continuous Y across pages
                pageNum: i
            });
        });

        // Extract horizontal lines from operator list
        const opList = await page.getOperatorList();
        const lines = extractHorizontalLines(opList, pageHeight, pageOffset, i);
        allHorizontalLines.push(...lines);

        pageOffset += pageHeight;
    }

    // Sort text items by Y (top to bottom) then by X (left to right)
    allTextItems.sort((a, b) => {
        const yDiff = a.y - b.y;
        if (Math.abs(yDiff) > 5) return yDiff;
        return a.x - b.x;
    });

    // Sort horizontal lines by Y position
    allHorizontalLines.sort((a, b) => a.y - b.y);

    console.log(`Total horizontal lines found: ${allHorizontalLines.length}`);

    // Filter to get significant section-dividing lines
    const sectionLines = filterSectionLines(allHorizontalLines);
    console.log(`Found ${sectionLines.length} section-dividing horizontal lines`);

    // Group text into lines
    const textLines = groupTextIntoLines(allTextItems);

    // Create sections based on horizontal lines
    const sections = createSections(textLines, sectionLines);
    console.log(`Created ${sections.length} sections`);

    // Debug: show first few sections
    sections.slice(0, 5).forEach((section, i) => {
        console.log(`Section ${i}: Y=${section.startY.toFixed(1)}-${section.endY.toFixed(1)}, lines=${section.lines.length}, first line: "${section.lines[0]?.substring(0, 60) || '(empty)'}"`);
    });

    // Build full text with section markers
    let fullText = '';
    sections.forEach((section, i) => {
        fullText += `\n===SECTION_${i}===\n`;
        fullText += section.lines.join('\n');
    });

    // Parse the extracted text with section info
    return parseAuditText(fullText, sections);
}

// Extract horizontal lines from PDF operator list
function extractHorizontalLines(opList, pageHeight, pageOffset, pageNum = 1) {
    const OPS = pdfjsLib.OPS;

    // Build a reverse lookup for OPS names (for debugging)
    const opsNames = {};
    for (const [name, value] of Object.entries(OPS)) {
        opsNames[value] = name;
    }

    let currentX = 0, currentY = 0;
    let pathStartX = 0, pathStartY = 0;

    // Collect pending lines from current path - only add them if path is stroked (not just filled)
    let pendingLines = [];

    // Final lines that passed the stroke test
    const lines = [];

    for (let i = 0; i < opList.fnArray.length; i++) {
        const fn = opList.fnArray[i];
        const args = opList.argsArray[i];

        switch (fn) {
            case OPS.moveTo:
                currentX = args[0];
                currentY = args[1];
                pathStartX = currentX;
                pathStartY = currentY;
                break;

            case OPS.lineTo:
                const endX = args[0];
                const endY = args[1];

                if (Math.abs(currentY - endY) < 1 && Math.abs(endX - currentX) > 50) {
                    const yFromTop = pageHeight - currentY;
                    pendingLines.push({
                        x1: Math.min(currentX, endX),
                        x2: Math.max(currentX, endX),
                        y: yFromTop + pageOffset,
                        width: Math.abs(endX - currentX)
                    });
                }
                currentX = endX;
                currentY = endY;
                break;

            case OPS.rectangle:
                const [rx, ry, rw, rh] = args;
                if (Math.abs(rh) < 3 && Math.abs(rw) > 50) {
                    const yFromTop = pageHeight - ry;
                    pendingLines.push({
                        x1: rx,
                        x2: rx + rw,
                        y: yFromTop + pageOffset,
                        width: Math.abs(rw)
                    });
                }
                break;

            case OPS.constructPath:
                if (args && args[0] && args[1]) {
                    const pathOps = args[0];
                    const coords = args[1];
                    let coordIdx = 0;

                    for (const pathOp of pathOps) {
                        if (pathOp === 13 && coordIdx + 1 < coords.length) {
                            // moveTo
                            currentX = coords[coordIdx++];
                            currentY = coords[coordIdx++];
                            pathStartX = currentX;
                            pathStartY = currentY;
                        } else if (pathOp === 14 && coordIdx + 1 < coords.length) {
                            // lineTo
                            const lx = coords[coordIdx++];
                            const ly = coords[coordIdx++];

                            if (Math.abs(currentY - ly) < 1 && Math.abs(lx - currentX) > 50) {
                                const yFromTop = pageHeight - currentY;
                                pendingLines.push({
                                    x1: Math.min(currentX, lx),
                                    x2: Math.max(currentX, lx),
                                    y: yFromTop + pageOffset,
                                    width: Math.abs(lx - currentX)
                                });
                            }
                            currentX = lx;
                            currentY = ly;
                        } else if (pathOp === 15 && coordIdx + 5 < coords.length) {
                            coordIdx += 6; // curveTo
                        } else if (pathOp === 16 && coordIdx + 3 < coords.length) {
                            coordIdx += 4; // curveTo2
                        } else if (pathOp === 17 && coordIdx + 1 < coords.length) {
                            coordIdx += 2; // curveTo3
                        } else if (pathOp === 18) {
                            // closePath
                            currentX = pathStartX;
                            currentY = pathStartY;
                        } else if (pathOp === 19 && coordIdx + 3 < coords.length) {
                            // rectangle
                            const rrx = coords[coordIdx++];
                            const rry = coords[coordIdx++];
                            const rrw = coords[coordIdx++];
                            const rrh = coords[coordIdx++];

                            if (Math.abs(rrh) < 3 && Math.abs(rrw) > 50) {
                                const yFromTop = pageHeight - rry;
                                pendingLines.push({
                                    x1: rrx,
                                    x2: rrx + rrw,
                                    y: yFromTop + pageOffset,
                                    width: Math.abs(rrw)
                                });
                            }
                        }
                    }
                }
                break;

            case OPS.closePath:
                currentX = pathStartX;
                currentY = pathStartY;
                break;

            // Stroke operations - these lines are actually drawn
            case OPS.stroke:
            case OPS.fillStroke:
            case OPS.eoFillStroke:
                lines.push(...pendingLines);
                pendingLines = [];
                break;

            // Fill operations - also keep these (thin filled rectangles are lines)
            case OPS.fill:
            case OPS.eoFill:
                lines.push(...pendingLines);
                pendingLines = [];
                break;

            // Begin new path - clear pending
            case OPS.beginPath:
                pendingLines = [];
                break;
        }
    }

    if (pageNum === 1) {
        console.log(`Page ${pageNum}: Found ${lines.length} horizontal lines (stroked + filled)`);
    }

    return lines;
}

// Filter horizontal lines to get significant section dividers
function filterSectionLines(lines, targetWidth = 535.5, tolerance = 2) {
    // Filter for lines within a specific width range (section dividers are ~535.5 wide)
    const wideLines = lines.filter(line =>
        line.width >= targetWidth - tolerance && line.width <= targetWidth + tolerance
    );

    console.log(`Lines with width ~${targetWidth}: ${wideLines.length}`);

    // Group lines by Y position (within 3 units = same line drawn multiple times)
    const groupedByY = [];
    let currentGroup = [];
    let groupY = null;

    // Sort by Y first
    wideLines.sort((a, b) => a.y - b.y);

    for (const line of wideLines) {
        if (groupY === null || Math.abs(line.y - groupY) <= 3) {
            currentGroup.push(line);
            if (groupY === null) groupY = line.y;
        } else {
            if (currentGroup.length > 0) {
                // Take the widest line from the group
                const widest = currentGroup.reduce((a, b) => a.width > b.width ? a : b);
                groupedByY.push(widest);
            }
            currentGroup = [line];
            groupY = line.y;
        }
    }
    // Don't forget the last group
    if (currentGroup.length > 0) {
        const widest = currentGroup.reduce((a, b) => a.width > b.width ? a : b);
        groupedByY.push(widest);
    }

    console.log(`After deduplication: ${groupedByY.length} unique lines`);

    // Skip the first 2 lines (header decorations, not section dividers)
    const sectionDividers = groupedByY.slice(2);

    // Show only the final section divider lines
    console.log(`=== SECTION DIVIDER LINES (${sectionDividers.length}) ===`);
    sectionDividers.forEach((line, i) => {
        console.log(`  ${i}: y=${line.y.toFixed(1)}, width=${line.width.toFixed(1)}`);
    });

    return sectionDividers;
}

// Group text items into lines based on Y position
function groupTextIntoLines(textItems) {
    const lines = [];
    let currentLine = [];
    let lastY = null;

    textItems.forEach(item => {
        if (lastY === null || Math.abs(item.y - lastY) > 5) {
            if (currentLine.length > 0) {
                lines.push({
                    text: currentLine.map(i => i.str).join(' '),
                    y: lastY
                });
            }
            currentLine = [item];
            lastY = item.y;
        } else {
            currentLine.push(item);
        }
    });

    if (currentLine.length > 0) {
        lines.push({
            text: currentLine.map(i => i.str).join(' '),
            y: lastY
        });
    }

    return lines;
}

// Create sections based on horizontal line positions
function createSections(textLines, sectionLines) {
    const sections = [];

    // Add a virtual line at the very beginning and end
    const lineYPositions = [0, ...sectionLines.map(l => l.y), Infinity];

    for (let i = 0; i < lineYPositions.length - 1; i++) {
        const startY = lineYPositions[i];
        const endY = lineYPositions[i + 1];

        // Find text lines within this section
        const sectionTextLines = textLines.filter(tl => tl.y > startY && tl.y < endY);

        if (sectionTextLines.length > 0) {
            sections.push({
                startY,
                endY,
                lines: sectionTextLines.map(tl => tl.text)
            });
        }
    }

    return sections;
}

// Determine if audit uses old rules (pre-2025) or new rules (2025+)
function usesOldRules(catalogYear) {
    if (!catalogYear) return false;
    const yearNum = parseInt(catalogYear);
    // Catalog year format is YYYYXX (e.g., 202510)
    // Old rules: < 202510, New rules: >= 202510
    return yearNum < 202510;
}

// Parse the text content of an audit
// sections: array of { startY, endY, lines: string[] } from PDF line detection
function parseAuditText(text, sections = []) {
    const result = {
        studentName: '',
        studentId: '',
        programCode: '',
        majorType: 'biology',  // 'biology' or 'biopsychology'
        catalogYear: '',
        useOldRules: false,
        courses: [],
        priorCredits: [],
        genEdStatus: {},
        oldGenEdStatus: {},  // For old rules: tracks multiple courses per category
        augsburgExperience: false,
        intentToGraduate: false,
        totalCreditsEarned: 0,
        totalCreditsInProgress: 0,
        udCreditsEarned: 0,
        udCreditsInProgress: 0,
        minorName: '',        // Name of minor if present
        minorCourses: [],     // Courses in the minor
        sections: sections    // Store sections for use in parsing
    };

    // Normalize text - replace multiple spaces/newlines with single space
    const normalizedText = text.replace(/\s+/g, ' ');

    // Extract student name (format: "LastName, FirstName")
    const nameMatch = normalizedText.match(/([A-Z][a-z]+),\s*([A-Z][a-z]+)/);
    if (nameMatch) {
        result.studentName = nameMatch[0];
    }

    // Extract student ID
    const idMatch = normalizedText.match(/\b(\d{8})\b/);
    if (idMatch) {
        result.studentId = idMatch[1];
    }

    // Extract program code
    const programMatch = normalizedText.match(/PROGRAM CODE:\s*(\S+)/i);
    if (programMatch) {
        result.programCode = programMatch[1];
        // Determine major type based on program code
        if (result.programCode.toUpperCase() === 'BIOPS-BS') {
            result.majorType = 'biopsychology';
        } else {
            result.majorType = 'biology';
        }
    }

    // Extract catalog year - look for 6-digit format YYYYMM (e.g., 202410)
    // The catalog year appears in the header as "CATALOG YEAR: 202410"
    // But PDF extraction may merge it with other text, so look for the 6-digit pattern
    let catalogMatch = normalizedText.match(/CATALOG\s*YEAR[:\s]*(\d{6})\b/i);
    if (!catalogMatch) {
        // Also try to find standalone 6-digit numbers that look like catalog years (2020xx-2029xx)
        catalogMatch = normalizedText.match(/\b(20[2-3]\d[01]\d)\b/);
    }
    if (catalogMatch) {
        result.catalogYear = catalogMatch[1];
    }

    // Debug: show what we found
    console.log('Catalog year extracted:', result.catalogYear);

    // Determine which rules to use based on catalog year
    result.useOldRules = usesOldRules(result.catalogYear);
    console.log(`Catalog year: ${result.catalogYear}, Using old rules: ${result.useOldRules}`);

    // Check for Augsburg Experience completion (PDF has "Category OK" format)
    result.augsburgExperience = /Augsburg Experience\s+OK/i.test(normalizedText);

    // Check for Intent to Graduate
    result.intentToGraduate = /Intent to Graduate[^N]*OK/i.test(normalizedText);

    // Parse Gen Ed status based on rules - pass sections for accurate boundaries
    if (result.useOldRules) {
        result.oldGenEdStatus = parseOldGenEdStatus(text, sections);
        result.genEdStatus = {}; // Clear new gen ed status
    } else {
        result.genEdStatus = parseGenEdStatus(text, sections);
    }

    // Parse courses (use original text to preserve line structure, pass sections for accurate boundaries)
    result.courses = parseCourses(text, result.useOldRules, sections);

    // Parse total credits from "128 credits" requirement section
    // Look for "NEEDS: xx.x Credits" and subtract from 128
    // Try multiple patterns since PDF text extraction varies
    let totalCreditsSection = text.match(/A minimum of 128 credits[\s\S]*?NEEDS:\s*([\d.]+)\s*Credits/i);

    if (!totalCreditsSection) {
        totalCreditsSection = text.match(/minimum[\s\S]{0,20}128[\s\S]*?NEEDS:\s*([\d.]+)\s*Credits/i);
    }

    if (!totalCreditsSection) {
        totalCreditsSection = text.match(/128\s+credits[\s\S]*?NEEDS:\s*([\d.]+)\s*Credits/i);
    }

    if (totalCreditsSection) {
        const needed = parseFloat(totalCreditsSection[1]);
        result.totalCreditsEarned = 128 - needed;
    } else {
        // Check if the 128 credits requirement shows complete status (+ indicator)
        const totalCreditsComplete = text.match(/\+\s+A minimum of 128 credits/i) ||
                                     text.match(/\+\s+128\s+credits/i);
        if (totalCreditsComplete) {
            result.totalCreditsEarned = 128;
            console.log('Total credits requirement shows + (complete) - setting to 128');
        } else {
            // Fallback: sum from courses
            result.courses.forEach(course => {
                if (course.grade === 'IP' || course.grade === 'In-P') {
                    result.totalCreditsInProgress += course.credits;
                } else {
                    result.totalCreditsEarned += course.credits;
                }
            });
        }
    }

    // Parse upper division credits from "At least 36 of your required 128" section
    // Look for "NEEDS: xx.x Credits" and subtract from 36
    let udCreditsSection = text.match(/At least 36 of your required 128[\s\S]*?NEEDS:\s*([\d.]+)\s*Credits/i);
    if (udCreditsSection) {
        const needed = parseFloat(udCreditsSection[1]);
        result.udCreditsEarned = 36 - needed;
        console.log(`UD credits: 36 - ${needed} needed = ${result.udCreditsEarned}`);
    } else {
        // Check if the UD credits requirement shows complete status (+ indicator)
        const udCreditsComplete = text.match(/\+\s+At least 36 of your required 128/i);
        if (udCreditsComplete) {
            result.udCreditsEarned = 36;
            console.log('UD credits requirement shows + (complete) - setting to 36');
        } else {
            // Check for in-progress status with earned credits shown
            // Pattern: "At least 36..." followed by "Earned: xx.x" or "In-progress: xx.x"
            const udCreditsEarned = text.match(/At least 36 of your required 128[\s\S]*?(?:Earned|Have):\s*([\d.]+)/i);
            if (udCreditsEarned) {
                result.udCreditsEarned = parseFloat(udCreditsEarned[1]);
                console.log(`UD credits from Earned/Have: ${result.udCreditsEarned}`);
            }
            // Also try to find in-progress UD credits
            const udCreditsInProgress = text.match(/At least 36 of your required 128[\s\S]*?In-progress:\s*([\d.]+)/i);
            if (udCreditsInProgress) {
                result.udCreditsInProgress = parseFloat(udCreditsInProgress[1]);
                console.log(`UD credits in progress: ${result.udCreditsInProgress}`);
            }
        }
    }

    // Parse minor if present - use sections for accurate boundaries
    const minorData = parseMinorSection(text, sections);
    if (minorData) {
        result.minorName = minorData.name;
        result.minorCourses = minorData.courses;
        console.log(`Minor found: ${result.minorName} with ${result.minorCourses.length} courses`);
    }

    return result;
}

// Parse minor section from audit text using section boundaries
// sections: array of { startY, endY, lines: string[] } from PDF line detection
// Returns { name: string, courses: array } or null if no minor found
function parseMinorSection(text, sections = []) {
    // First, try to find the minor section using the sections array (most reliable)
    if (sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const sectionText = section.lines.join('\n');

            // Look for "Minor in" header in this section
            const minorMatch = sectionText.match(/(?:^|\n)(OK|NO|IP)\s+Minor in\s+([^\n]+)/im);
            if (minorMatch) {
                const minorName = minorMatch[2].trim();
                console.log(`Found minor section ${i}: "${minorName}"`);
                console.log('Minor section text:', sectionText.substring(0, 500));

                // Parse courses from this section only
                const courses = parseCoursesFromSectionText(sectionText);
                console.log(`Found ${courses.length} courses in minor section`);

                return {
                    name: minorName,
                    courses: courses.map(c => ({ ...c, isMinor: true }))
                };
            }
        }
    }

    // Fallback: use text-based detection if sections not available
    console.log('Sections not available, using text-based minor detection');
    const minorHeaderMatch = text.match(/(?:^|\n)(OK|NO|IP)\s+Minor in\s+([^\n]+)/im);

    if (!minorHeaderMatch) {
        console.log('No minor section found');
        return null;
    }

    const minorName = minorHeaderMatch[2].trim();
    console.log(`Found minor (text-based): "${minorName}"`);

    // For fallback, look for next section marker
    const afterMinor = text.substring(minorHeaderMatch.index + minorHeaderMatch[0].length);
    const nextSectionMatch = afterMinor.match(/\n===SECTION_\d+===/);
    const minorSectionText = nextSectionMatch
        ? afterMinor.substring(0, nextSectionMatch.index)
        : afterMinor.substring(0, 1000);

    const courses = parseCoursesFromSectionText(minorSectionText);

    return {
        name: minorName,
        courses: courses.map(c => ({ ...c, isMinor: true }))
    };
}

// Parse courses from a section of text
function parseCoursesFromSectionText(sectionText) {
    const courses = [];

    // Look for courses after "Term Course Credits Grade Title" headers
    const headerPattern = /Term\s+Course\s+Credits\s+Grade\s+Title(?:\s+Institution)?(?:\s+Course)?/gi;
    let headerMatch;

    while ((headerMatch = headerPattern.exec(sectionText)) !== null) {
        const afterHeader = sectionText.substring(headerMatch.index + headerMatch[0].length);
        const nextHeaderIdx = afterHeader.search(/Term\s+Course\s+Credits\s+Grade\s+Title(?:\s+Institution)?(?:\s+Course)?/i);
        const searchArea = nextHeaderIdx > 0 ? afterHeader.substring(0, nextHeaderIdx) : afterHeader.substring(0, 500);

        // Course pattern: Term CourseCode Credits Grade
        const coursePattern = /\b(FA|SP|SU|T1|T2|T3|TU|TF|TS|AC)\d{2}\s+([A-Z]{2,5}\d{1,4}[A-Z]?)\s+(\d+(?:\.\d)?)\s+(A[+-]?|B[+-]?|C[+-]?|D[+-]?|F|P|LP|IP|TB|TA|TC|TD|TW[A-Z]?|CR|STA?|In-P)/gi;
        let courseMatch;

        while ((courseMatch = coursePattern.exec(searchArea)) !== null) {
            const term = courseMatch[1].toUpperCase() + courseMatch[0].match(/\d{2}/)[0];
            const courseId = courseMatch[2].toUpperCase();
            const credits = parseFloat(courseMatch[3]);
            const grade = courseMatch[4].toUpperCase();

            courses.push({
                term,
                courseId,
                credits,
                grade: grade === 'IN-P' ? 'IP' : grade
            });
            console.log(`Section course found: ${courseId} (${term}) ${credits}cr`);
        }
    }

    return courses;
}

// Parse Gen Ed requirement status from audit text (2025+ catalog years)
// Format: OK/NO/IP followed by section name at start of line
// sections: array of { startY, endY, lines: string[] } from PDF line detection
// Returns object with completion status and courses for each category
function parseGenEdStatus(text, sections = []) {
    const status = {
        writing: { complete: false, courses: [] },
        math: { complete: false, courses: [] },
        sustWell: { complete: false, courses: [] },
        communication: { complete: false, courses: [] },
        localGlobal: { complete: false, courses: [] },
        epsj: { complete: false, courses: [] },
        lab: { complete: false, courses: [] },
        art: { complete: false, courses: [] },
        religion: { complete: false, courses: [] },
        behavioral: { complete: false, courses: [] },
        humanities: { complete: false, courses: [] }
    };

    // Define section names and their category mappings
    const sectionDefs = [
        { name: 'Writing', category: 'writing' },
        { name: 'Mathematical Sciences', category: 'math' },
        { name: 'Sustainability and Wellness', category: 'sustWell' },
        { name: 'Languages and Oral Communication', category: 'communication' },
        { name: 'Local and Global Perspectives', category: 'localGlobal' },
        { name: 'Equity[,\\s]*Power and Social Justice', category: 'epsj' },
        { name: 'Natural Sciences with Lab', category: 'lab' },
        { name: 'Arts(?!\\s+and)', category: 'art' },  // Negative lookahead to avoid "Arts and Sciences"
        { name: 'RLN.Search for Meaning', category: 'religion' },
        { name: 'Social and Behavioral Sciences', category: 'behavioral' },
        { name: 'Humanities', category: 'humanities' }
    ];

    // If sections are available, use them for accurate boundaries
    if (sections.length > 0) {
        console.log('Gen Ed: Using section boundaries from PDF lines');

        sectionDefs.forEach(def => {
            const pattern = new RegExp('(OK|NO|IP)\\s+' + def.name, 'im');

            // Find the section that contains this Gen Ed category
            for (const section of sections) {
                const sectionText = section.lines.join('\n');
                const match = sectionText.match(pattern);

                if (match) {
                    const statusObj = status[def.category];
                    statusObj.complete = match[1].toUpperCase() === 'OK' || match[1].toUpperCase() === 'IP';

                    console.log(`Gen Ed: Found "${def.category}" in section Y=${section.startY.toFixed(1)}-${section.endY.toFixed(1)}, status=${match[1]}`);

                    // Parse courses from this section only
                    statusObj.courses = parseCoursesFromSectionText(sectionText);

                    // Filter out 1-credit lab courses
                    statusObj.courses = statusObj.courses.filter(c => !(c.credits <= 1 && c.courseId.endsWith('L')));

                    console.log(`Gen Ed ${def.category}: complete=${statusObj.complete}, courses=${statusObj.courses.map(c => c.courseId).join(', ')}`);
                    break;  // Found it, move to next category
                }
            }
        });

        console.log('Gen Ed Status parsed (using sections):', status);
        return status;
    }

    // Fallback: use text-based boundary detection if sections not available
    console.log('Gen Ed: Using text-based boundary detection (fallback)');

    // Find all section boundaries (OK/NO/IP followed by section name)
    const sectionBoundaries = [];
    sectionDefs.forEach(def => {
        const pattern = new RegExp('(?:^|\\n)(OK|NO|IP)\\s+' + def.name, 'im');
        const match = text.match(pattern);
        if (match) {
            console.log(`Gen Ed: Found section "${def.category}" at index ${match.index}, status=${match[1]}`);
            sectionBoundaries.push({
                category: def.category,
                statusCode: match[1].toUpperCase(),
                isComplete: match[1].toUpperCase() === 'OK' || match[1].toUpperCase() === 'IP',
                startIndex: match.index,
                name: def.name
            });
        } else {
            console.log(`Gen Ed: Section "${def.category}" NOT FOUND with pattern: ${pattern}`);
        }
    });

    // Sort by position in text
    sectionBoundaries.sort((a, b) => a.startIndex - b.startIndex);

    // Find where Major section starts (to mark end of Gen Ed sections)
    const majorMatch = text.match(/\n(?:OK|NO|IP)\s+Major in/i);
    const majorIndex = majorMatch ? majorMatch.index : text.length;

    // Process each section
    sectionBoundaries.forEach((section, idx) => {
        const statusObj = status[section.category];
        statusObj.complete = section.isComplete;

        // Find end of this section (start of next section or Major)
        let endIndex;
        if (idx < sectionBoundaries.length - 1) {
            endIndex = sectionBoundaries[idx + 1].startIndex;
        } else {
            endIndex = majorIndex;
        }

        // Extract section text
        const sectionText = text.substring(section.startIndex, endIndex);

        // Find courses after "Term Course Credits Grade Title" headers
        const headerPattern = /Term\s+Course\s+Credits\s+Grade\s+Title(?:\s+Institution)?(?:\s+Course)?/gi;
        let headerMatch;
        const coursesFound = [];

        while ((headerMatch = headerPattern.exec(sectionText)) !== null) {
            const afterHeader = sectionText.substring(headerMatch.index + headerMatch[0].length);
            const nextHeaderIdx = afterHeader.search(/Term\s+Course\s+Credits\s+Grade\s+Title(?:\s+Institution)?(?:\s+Course)?/i);
            const searchArea = nextHeaderIdx > 0 ? afterHeader.substring(0, nextHeaderIdx) : afterHeader.substring(0, 300);

            const coursePattern = /\b(FA|SP|SU|T1|T2|T3|TU|TF|TS|AC)\d{2}\s+([A-Z]{2,5}\d{1,4}[A-Z]?)\s+(\d+(?:\.\d)?)\s+(A[+-]?|B[+-]?|C[+-]?|D[+-]?|F|P|LP|IP|TB|TA|TC|TD|TW[A-Z]?|CR|STA?|In-P)/gi;
            let courseMatch;

            while ((courseMatch = coursePattern.exec(searchArea)) !== null) {
                const term = courseMatch[1].toUpperCase() + courseMatch[0].match(/\d{2}/)[0];
                const courseId = courseMatch[2].toUpperCase();
                const credits = parseFloat(courseMatch[3]);

                // Skip 1-credit lab courses
                if (credits <= 1 && courseId.endsWith('L')) {
                    continue;
                }

                coursesFound.push({ term, courseId, credits });
                console.log(`Gen Ed ${section.category}: found course ${courseId} (${term})`);
            }
        }

        statusObj.courses = coursesFound;
        console.log(`Gen Ed ${section.category}: complete=${statusObj.complete}, courses=${coursesFound.map(c => c.courseId).join(', ')}`);
    });

    console.log('Gen Ed Status parsed:', status);
    return status;
}

// Parse OLD Gen Ed requirement status from audit text (pre-2025 catalog years)
// sections: array of { startY, endY, lines: string[] } from PDF line detection
function parseOldGenEdStatus(text, sections = []) {
    const status = {
        effectiveWriting: { complete: false, required: 1, have: 0, courses: [] },
        modernLanguage: { complete: false, required: 2, have: 0, courses: [] },
        wellness: { complete: false, required: 2, have: 0, courses: [] },
        searchMeaning1: { complete: false, required: 1, have: 0, courses: [] },
        searchMeaning2: { complete: false, required: 1, have: 0, courses: [] },
        sciMathLAF: { complete: false, required: 2, have: 0, courses: [] },
        socialBehavLAF: { complete: false, required: 2, have: 0, courses: [] },
        fineArtsLAF: { complete: false, required: 2, have: 0, courses: [] },
        humanitiesLAF: { complete: false, required: 2, have: 0, courses: [] }
    };

    // Define section names and their category mappings
    // These must match exactly what appears in the PDF after OK/NO
    const sectionDefs = [
        { name: 'Effective Writing II', category: 'effectiveWriting' },
        { name: 'Modern Language I and II', category: 'modernLanguage' },
        { name: 'Wellness', category: 'wellness' },
        { name: 'Search for Meaning I(?!I)', category: 'searchMeaning1' },  // Negative lookahead to avoid matching II
        { name: 'Search for Meaning II', category: 'searchMeaning2' },
        { name: 'Natural Science and Math Liberal Arts Foundation \\(LAF\\)', category: 'sciMathLAF' },
        { name: 'Social/Behavioral Sciences Liberal Arts Foundation \\(LAF\\)', category: 'socialBehavLAF' },
        { name: 'Fine Arts Liberal Arts Foundation \\(LAF\\)', category: 'fineArtsLAF' },
        { name: 'Humanities Liberal Arts Foundation \\(LAF\\)', category: 'humanitiesLAF' }
    ];

    // Major course prefixes to skip in Sci/Math LAF (these are placed via major requirements)
    const majorPrefixes = ['BIO', 'CHM', 'PHY', 'MAT'];

    // If sections are available, use them for accurate boundaries
    if (sections.length > 0) {
        console.log('Old Gen Ed: Using section boundaries from PDF lines');

        sectionDefs.forEach(def => {
            const pattern = new RegExp('(OK|NO|IP)\\s+' + def.name, 'im');

            // Find the section that contains this Gen Ed category
            for (const section of sections) {
                const sectionText = section.lines.join('\n');
                const match = sectionText.match(pattern);

                if (match) {
                    const statusObj = status[def.category];
                    statusObj.complete = match[1].toUpperCase() === 'OK';

                    console.log(`Old Gen Ed: Found "${def.category}" in section Y=${section.startY.toFixed(1)}-${section.endY.toFixed(1)}, status=${match[1]}`);

                    // Parse courses from this section only
                    let coursesFound = parseCoursesFromSectionText(sectionText);

                    // Filter out 1-credit lab courses
                    coursesFound = coursesFound.filter(c => !(c.credits <= 1 && c.courseId.endsWith('L')));

                    // Skip major courses in Sci/Math LAF section
                    if (def.category === 'sciMathLAF') {
                        coursesFound = coursesFound.filter(c => {
                            const prefix = c.courseId.replace(/\d+L?$/, '');
                            if (majorPrefixes.includes(prefix)) {
                                console.log(`Old Gen Ed ${def.category}: skipping major course ${c.courseId}`);
                                return false;
                            }
                            return true;
                        });
                    }

                    statusObj.courses = coursesFound;

                    // Set have count
                    if (statusObj.complete) {
                        statusObj.have = statusObj.required;
                    } else {
                        const uniqueCourses = new Set(coursesFound.map(c => c.courseId));
                        statusObj.have = Math.min(uniqueCourses.size, statusObj.required);
                    }

                    console.log(`Old Gen Ed ${def.category}: complete=${statusObj.complete}, have=${statusObj.have}, courses=${coursesFound.map(c => c.courseId).join(', ')}`);
                    break;  // Found it, move to next category
                }
            }
        });

        console.log('Old Gen Ed Status parsed (using sections):', status);
        return status;
    }

    // Fallback: use text-based boundary detection if sections not available
    console.log('Old Gen Ed: Using text-based boundary detection (fallback)');

    // Course pattern: Term Course Credits Grade (e.g., "FA24 FLM180 4.0 C+")
    // Valid terms: FA, SP, SU, T1, T2, T3, TU, TF, TS followed by 2 digits
    const coursePattern = /\b(FA|SP|SU|T1|T2|T3|TU|TF|TS)\d{2}\s+([A-Z]{2,5}\d{1,4}[A-Z]?)\s+(\d+(?:\.\d)?)\s+(A[+-]?|B[+-]?|C[+-]?|D[+-]?|F|P|LP|IP|TB|TA|TC|TD|TW[A-Z]?|CR|STA?)/gi;

    // Find all section boundaries (OK/NO followed by section name)
    const sectionBoundaries = [];
    sectionDefs.forEach(def => {
        // Try both \n and start-of-string patterns
        const pattern = new RegExp('(?:^|\\n)(OK|NO)\\s+' + def.name, 'im');
        const match = text.match(pattern);
        if (match) {
            console.log(`Old Gen Ed: Found section "${def.category}" at index ${match.index}, status=${match[1]}`);
            sectionBoundaries.push({
                category: def.category,
                isComplete: match[1].toUpperCase() === 'OK',
                startIndex: match.index,
                name: def.name
            });
        } else {
            console.log(`Old Gen Ed: Section "${def.category}" NOT FOUND with pattern: ${pattern}`);
            // Debug: show what's in the text around expected location
            const simpleMatch = text.match(new RegExp(def.name.replace(/[()]/g, '\\$&'), 'i'));
            if (simpleMatch) {
                console.log(`  But found "${def.name}" at index ${simpleMatch.index}, context: "${text.substring(Math.max(0, simpleMatch.index - 20), simpleMatch.index + 50)}"`);
            }
        }
    });

    // Sort by position in text
    sectionBoundaries.sort((a, b) => a.startIndex - b.startIndex);

    // Also find where Major section starts (to mark end of Gen Ed sections)
    const majorMatch = text.match(/\n(?:OK|NO)\s+Major in/i);
    const majorIndex = majorMatch ? majorMatch.index : text.length;

    // Process each section
    sectionBoundaries.forEach((section, idx) => {
        const statusObj = status[section.category];
        statusObj.complete = section.isComplete;

        // Find end of this section (start of next section or Major)
        let endIndex;
        if (idx < sectionBoundaries.length - 1) {
            endIndex = sectionBoundaries[idx + 1].startIndex;
        } else {
            endIndex = majorIndex;
        }

        // Extract section text
        const sectionText = text.substring(section.startIndex, endIndex);

        // Find courses after "Term Course Credits Grade Title" headers
        const headerPattern = /Term\s+Course\s+Credits\s+Grade\s+Title(?:\s+Institution)?(?:\s+Course)?/gi;
        let headerMatch;
        const coursesFound = [];

        // Reset coursePattern for each section
        coursePattern.lastIndex = 0;

        while ((headerMatch = headerPattern.exec(sectionText)) !== null) {
            // Look for courses after this header (within next ~200 chars or until next header)
            const afterHeader = sectionText.substring(headerMatch.index + headerMatch[0].length);
            const nextHeaderIdx = afterHeader.search(/Term\s+Course\s+Credits\s+Grade\s+Title(?:\s+Institution)?(?:\s+Course)?/i);
            const searchArea = nextHeaderIdx > 0 ? afterHeader.substring(0, nextHeaderIdx) : afterHeader.substring(0, 300);

            let courseMatch;
            const localCoursePattern = /\b(FA|SP|SU|T1|T2|T3|TU|TF|TS)\d{2}\s+([A-Z]{2,5}\d{1,4}[A-Z]?)\s+(\d+(?:\.\d)?)\s+(A[+-]?|B[+-]?|C[+-]?|D[+-]?|F|P|LP|IP|TB|TA|TC|TD|TW[A-Z]?|CR|STA?)/gi;

            while ((courseMatch = localCoursePattern.exec(searchArea)) !== null) {
                const term = courseMatch[1].toUpperCase() + courseMatch[0].match(/\d{2}/)[0];
                const courseId = courseMatch[2].toUpperCase();
                const credits = parseFloat(courseMatch[3]);

                // Skip 1-credit lab courses
                if (credits <= 1 && courseId.endsWith('L')) {
                    continue;
                }

                // Skip major courses in Sci/Math LAF section
                if (section.category === 'sciMathLAF') {
                    const prefix = courseId.replace(/\d+L?$/, '');
                    if (majorPrefixes.includes(prefix)) {
                        console.log(`Old Gen Ed ${section.category}: skipping major course ${courseId}`);
                        continue;
                    }
                }

                coursesFound.push({ term, courseId, credits });
                console.log(`Old Gen Ed ${section.category}: found course ${courseId} (${term})`);
            }
        }

        // Store courses and count
        statusObj.courses = coursesFound;
        if (statusObj.complete) {
            statusObj.have = statusObj.required;
        } else {
            // Count unique courses (by courseId) for partial completion
            const uniqueCourses = new Set(coursesFound.map(c => c.courseId));
            statusObj.have = Math.min(uniqueCourses.size, statusObj.required);
        }

        console.log(`Old Gen Ed ${section.category}: complete=${statusObj.complete}, have=${statusObj.have}, courses=${coursesFound.map(c => c.courseId).join(', ')}`);
    });

    console.log('Old Gen Ed Status parsed:', status);
    return status;
}

// Parse Gen Ed sections from audit text and map courses to their categories
// Returns a Map of courseId -> genEdCategory based on where courses appear in the audit
// sections: array of { startY, endY, lines: string[] } from PDF line detection
function parseGenEdCourseMappings(text, sections = []) {
    const courseToGenEd = new Map();
    const genEdCompleted = new Set();

    // Define section names (same as parseGenEdStatus)
    const sectionDefs = [
        { name: 'Writing', category: 'writing' },
        { name: 'Mathematical Sciences', category: 'math' },
        { name: 'Sustainability and Wellness', category: 'sustWell' },
        { name: 'Languages and Oral Communication', category: 'communication' },
        { name: 'Local and Global Perspectives', category: 'localGlobal' },
        { name: 'Equity[,\\s]*Power and Social Justice', category: 'epsj' },
        { name: 'Natural Sciences with Lab', category: 'lab' },
        { name: 'Arts(?!\\s+and)', category: 'art' },
        { name: 'RLN.Search for Meaning', category: 'religion' },
        { name: 'Social and Behavioral Sciences', category: 'behavioral' },
        { name: 'Humanities', category: 'humanities' }
    ];

    // If sections are available, use them for accurate boundaries
    if (sections.length > 0) {
        sectionDefs.forEach(def => {
            const pattern = new RegExp('(OK|NO|IP)\\s+' + def.name, 'im');

            for (const section of sections) {
                const sectionText = section.lines.join('\n');
                const match = sectionText.match(pattern);

                if (match) {
                    const isComplete = match[1].toUpperCase() === 'OK' || match[1].toUpperCase() === 'IP';
                    if (isComplete) {
                        genEdCompleted.add(def.category);
                    }

                    // Parse courses from this section
                    const courses = parseCoursesFromSectionText(sectionText);
                    courses.forEach(c => {
                        // Skip 1-credit lab courses
                        if (!(c.credits <= 1 && c.courseId.endsWith('L'))) {
                            courseToGenEd.set(c.courseId, def.category);
                        }
                    });
                    break;
                }
            }
        });

        console.log('Gen Ed course mappings (using sections):', Object.fromEntries(courseToGenEd));
        parseGenEdCourseMappings.completedCategories = genEdCompleted;
        return courseToGenEd;
    }

    // Fallback: text-based boundary detection
    const sectionBoundaries = [];
    sectionDefs.forEach(def => {
        const pattern = new RegExp('(?:^|\\n)(OK|NO|IP)\\s+' + def.name, 'im');
        const match = text.match(pattern);
        if (match) {
            sectionBoundaries.push({
                category: def.category,
                isComplete: match[1].toUpperCase() === 'OK' || match[1].toUpperCase() === 'IP',
                startIndex: match.index
            });
        }
    });

    sectionBoundaries.sort((a, b) => a.startIndex - b.startIndex);

    // Find Major section start
    const majorMatch = text.match(/\n(?:OK|NO|IP)\s+Major in/i);
    const majorIndex = majorMatch ? majorMatch.index : text.length;

    // Process each section
    sectionBoundaries.forEach((section, idx) => {
        if (section.isComplete) {
            genEdCompleted.add(section.category);
        }

        // Find end of this section
        let endIndex = idx < sectionBoundaries.length - 1
            ? sectionBoundaries[idx + 1].startIndex
            : majorIndex;

        const sectionText = text.substring(section.startIndex, endIndex);

        // Find courses after "Term Course Credits Grade Title" headers
        const headerPattern = /Term\s+Course\s+Credits\s+Grade\s+Title(?:\s+Institution)?(?:\s+Course)?/gi;
        let headerMatch;

        while ((headerMatch = headerPattern.exec(sectionText)) !== null) {
            const afterHeader = sectionText.substring(headerMatch.index + headerMatch[0].length);
            const nextHeaderIdx = afterHeader.search(/Term\s+Course\s+Credits\s+Grade\s+Title(?:\s+Institution)?(?:\s+Course)?/i);
            const searchArea = nextHeaderIdx > 0 ? afterHeader.substring(0, nextHeaderIdx) : afterHeader.substring(0, 300);

            const coursePattern = /\b(FA|SP|SU|T1|T2|T3|TU|TF|TS|AC)\d{2}\s+([A-Z]{2,5}\d{1,4}[A-Z]?)\s+(\d+(?:\.\d)?)\s+(A[+-]?|B[+-]?|C[+-]?|D[+-]?|F|P|LP|IP|TB|TA|TC|TD|TW[A-Z]?|CR|STA?|In-P)/gi;
            let courseMatch;

            while ((courseMatch = coursePattern.exec(searchArea)) !== null) {
                const courseId = courseMatch[2].toUpperCase();
                const credits = parseFloat(courseMatch[3]);

                // Skip 1-credit lab courses
                if (credits <= 1 && courseId.endsWith('L')) continue;

                courseToGenEd.set(courseId, section.category);
                console.log(`Gen Ed mapping: ${courseId} -> ${section.category}`);
            }
        }
    });

    console.log('Gen Ed course mappings:', Object.fromEntries(courseToGenEd));
    parseGenEdCourseMappings.completedCategories = genEdCompleted;

    return courseToGenEd;
}

// Parse OLD Gen Ed sections from audit text (pre-2025 catalog years)
// Returns a Map of courseId -> oldGenEdCategory
// sections: array of { startY, endY, lines: string[] } from PDF line detection
function parseOldGenEdCourseMappings(text, sections = []) {
    const courseToGenEd = new Map();
    const genEdCompleted = new Set();

    // Define section names (same as parseOldGenEdStatus)
    const sectionDefs = [
        { name: 'Effective Writing II', category: 'effectiveWriting' },
        { name: 'Modern Language I and II', category: 'modernLanguage' },
        { name: 'Wellness', category: 'wellness' },
        { name: 'Search for Meaning I(?!I)', category: 'searchMeaning1' },
        { name: 'Search for Meaning II', category: 'searchMeaning2' },
        { name: 'Natural Science and Math Liberal Arts Foundation \\(LAF\\)', category: 'sciMathLAF' },
        { name: 'Social/Behavioral Sciences Liberal Arts Foundation \\(LAF\\)', category: 'socialBehavLAF' },
        { name: 'Fine Arts Liberal Arts Foundation \\(LAF\\)', category: 'fineArtsLAF' },
        { name: 'Humanities Liberal Arts Foundation \\(LAF\\)', category: 'humanitiesLAF' }
    ];

    // Major course prefixes to skip in Sci/Math LAF
    const majorPrefixes = ['BIO', 'CHM', 'PHY', 'MAT'];

    // If sections are available, use them for accurate boundaries
    if (sections.length > 0) {
        sectionDefs.forEach(def => {
            const pattern = new RegExp('(OK|NO)\\s+' + def.name, 'im');

            for (const section of sections) {
                const sectionText = section.lines.join('\n');
                const match = sectionText.match(pattern);

                if (match) {
                    const isComplete = match[1].toUpperCase() === 'OK';
                    if (isComplete) {
                        genEdCompleted.add(def.category);
                    }

                    // Parse courses from this section
                    const courses = parseCoursesFromSectionText(sectionText);
                    courses.forEach(c => {
                        // Skip 1-credit lab courses
                        if (c.credits <= 1 && c.courseId.endsWith('L')) return;

                        // Skip major courses in Sci/Math LAF
                        if (def.category === 'sciMathLAF') {
                            const prefix = c.courseId.replace(/\d+L?$/, '');
                            if (majorPrefixes.includes(prefix)) return;
                        }

                        courseToGenEd.set(c.courseId, def.category);
                    });
                    break;
                }
            }
        });

        console.log('Old Gen Ed course mappings (using sections):', Object.fromEntries(courseToGenEd));
        parseOldGenEdCourseMappings.completedCategories = genEdCompleted;
        return courseToGenEd;
    }

    // Fallback: text-based boundary detection
    const sectionBoundaries = [];
    sectionDefs.forEach(def => {
        const pattern = new RegExp('(?:^|\\n)(OK|NO)\\s+' + def.name, 'im');
        const match = text.match(pattern);
        if (match) {
            sectionBoundaries.push({
                category: def.category,
                isComplete: match[1].toUpperCase() === 'OK',
                startIndex: match.index
            });
        }
    });

    sectionBoundaries.sort((a, b) => a.startIndex - b.startIndex);

    // Find Major section start
    const majorMatch = text.match(/\n(?:OK|NO)\s+Major in/i);
    const majorIndex = majorMatch ? majorMatch.index : text.length;

    // Process each section
    sectionBoundaries.forEach((section, idx) => {
        if (section.isComplete) {
            genEdCompleted.add(section.category);
        }

        // Find end of this section
        let endIndex = idx < sectionBoundaries.length - 1
            ? sectionBoundaries[idx + 1].startIndex
            : majorIndex;

        const sectionText = text.substring(section.startIndex, endIndex);

        // Find courses after "Term Course Credits Grade Title" headers
        const headerPattern = /Term\s+Course\s+Credits\s+Grade\s+Title(?:\s+Institution)?(?:\s+Course)?/gi;
        let headerMatch;

        while ((headerMatch = headerPattern.exec(sectionText)) !== null) {
            const afterHeader = sectionText.substring(headerMatch.index + headerMatch[0].length);
            const nextHeaderIdx = afterHeader.search(/Term\s+Course\s+Credits\s+Grade\s+Title(?:\s+Institution)?(?:\s+Course)?/i);
            const searchArea = nextHeaderIdx > 0 ? afterHeader.substring(0, nextHeaderIdx) : afterHeader.substring(0, 300);

            const coursePattern = /\b(FA|SP|SU|T1|T2|T3|TU|TF|TS)\d{2}\s+([A-Z]{2,5}\d{1,4}[A-Z]?)\s+(\d+(?:\.\d)?)\s+(A[+-]?|B[+-]?|C[+-]?|D[+-]?|F|P|LP|IP|TB|TA|TC|TD|TW[A-Z]?|CR|STA?)/gi;
            let courseMatch;

            while ((courseMatch = coursePattern.exec(searchArea)) !== null) {
                const courseId = courseMatch[2].toUpperCase();
                const credits = parseFloat(courseMatch[3]);

                // Skip 1-credit lab courses
                if (credits <= 1 && courseId.endsWith('L')) continue;

                // Skip major courses in Sci/Math LAF
                if (section.category === 'sciMathLAF') {
                    const prefix = courseId.replace(/\d+L?$/, '');
                    if (majorPrefixes.includes(prefix)) continue;
                }

                courseToGenEd.set(courseId, section.category);
            }
        }
    });

    console.log('Old Gen Ed course mappings:', Object.fromEntries(courseToGenEd));
    parseOldGenEdCourseMappings.completedCategories = genEdCompleted;

    return courseToGenEd;
}

// Parse course entries from audit text
// sections: array of { startY, endY, lines: string[] } from PDF line detection
function parseCourses(text, useOldRules = false, sections = []) {
    const courses = [];
    const seenCourses = new Set();

    // Build a map of courseId -> genEdCategory based on audit section locations
    const genEdMap = useOldRules ? parseOldGenEdCourseMappings(text, sections) : parseGenEdCourseMappings(text, sections);

    // Regular expression patterns for course entries
    // Pattern: Term CourseCode Credits Grade Title
    // Examples:
    //   FA24 BIO151 4.0 A Introductory Biology
    //   SP25 CHM116 4.0 IP General Chemistry II
    //   TU25 CHM115 3.0 TB General Chemistry I

    const coursePattern = /\b(FA|SP|SU|T1|T2|T3|TU|TF|TS|AC)\d{2}\s+([A-Z]{2,5}\d{1,4}[A-Z]?)\s+(\d+(?:\.\d)?)\s+(A[+-]?|B[+-]?|C[+-]?|D[+-]?|F|P|LP|IP|TB|TA|TC|TD|TW[A-Z]?|L|CR|STA?|MPG\d?|In-P)/gi;

    let match;
    while ((match = coursePattern.exec(text)) !== null) {
        const [fullMatch, , courseId, creditsStr, grade] = match;

        // Extract term from the full match
        const termMatch = fullMatch.match(/^(FA|SP|SU|T1|T2|T3|TU|TF|TS|AC)\d{2}/i);
        const term = termMatch ? termMatch[0].toUpperCase() : null;

        if (!term) continue;

        const credits = parseFloat(creditsStr);
        const normalizedCourseId = courseId.toUpperCase();

        // Skip if this is a lab course and we already have the main course
        const baseId = normalizedCourseId.replace(/L$/, '');
        if (normalizedCourseId.endsWith('L') && seenCourses.has(baseId)) {
            // Add lab credits to main course if needed
            const mainCourse = courses.find(c => c.courseId === baseId);
            if (mainCourse && credits > 0) {
                // Lab already counted in main course credits for bio/chem
            }
            continue;
        }

        // Skip if we've already seen this exact course
        const courseKey = `${term}-${normalizedCourseId}`;
        if (seenCourses.has(courseKey)) {
            continue;
        }
        seenCourses.add(courseKey);
        seenCourses.add(normalizedCourseId);

        // Skip 0-credit entries (like placement tests, lab sections with L grade)
        if (credits === 0 && grade !== 'L') {
            continue;
        }

        // Normalize grade
        let normalizedGrade = grade.toUpperCase();
        if (normalizedGrade === 'IN-P') {
            normalizedGrade = 'IP';
        }

        // Check if this course fulfills a Gen Ed requirement (based on audit section location)
        const genEdCategory = genEdMap.get(normalizedCourseId) || null;

        courses.push({
            term,
            courseId: normalizedCourseId,
            credits,
            grade: normalizedGrade,
            isTransfer: term.startsWith('T'),
            isInProgress: normalizedGrade === 'IP',
            genEdCategory: genEdCategory
        });
    }

    // Sort courses by term
    courses.sort((a, b) => {
        const dateA = termToSortDate(a.term);
        const dateB = termToSortDate(b.term);
        return dateA - dateB;
    });

    return courses;
}

// Convert term code to a sortable date value
function termToSortDate(term) {
    const match = term.match(/^(FA|SP|SU|T1|T2|T3|TU|TF|TS|AC)(\d{2})$/i);
    if (!match) return 0;

    const [, season, yearStr] = match;
    const year = 2000 + parseInt(yearStr);

    // Assign a numeric value for sorting within the year
    let monthValue;
    switch (season.toUpperCase()) {
        case 'SP':
        case 'T2':
        case 'TS':
            monthValue = 1; // Spring
            break;
        case 'SU':
        case 'T3':
        case 'TU':
            monthValue = 5; // Summer
            break;
        case 'FA':
        case 'T1':
        case 'TF':
        default:
            monthValue = 8; // Fall
            break;
        case 'AC':
            monthValue = 0; // Achievement/Placement (sort first)
            break;
    }

    return year * 100 + monthValue;
}

// Determine if a course is a biology major course
function isBiologyMajorCourse(courseId) {
    const majorCourses = [
        'BIO151', 'BIO152', 'BIO354', 'BIO355',
        'BIO320', 'BIO361', 'BIO369', 'BIO370', 'BIO420',
        'BIO444', 'BIO473', 'BIO474', 'BIO475', 'BIO476',
        'BIO481', 'BIO485', 'BIO486', 'BIO490',
        'CHM115', 'CHM116', 'CHM251',
        'MAT114', 'MAT145', 'MAT163',
        'PHY107', 'PHY116', 'PHY121',
        'DST164', 'PSY215'
    ];

    return majorCourses.includes(courseId.replace(/L$/, ''));
}

// Check if course counts as upper division
function isCourseUpperDivision(courseId) {
    const numMatch = courseId.match(/\d{3}/);
    if (numMatch) {
        const num = parseInt(numMatch[0]);
        return num >= 300 && num < 500;
    }
    return false;
}

// Export for testing (Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseAuditPDF,
        parseAuditText,
        parseCourses,
        parseGenEdStatus,
        parseOldGenEdStatus,
        parseGenEdCourseMappings,
        parseOldGenEdCourseMappings,
        usesOldRules,
        termToSortDate,
        isBiologyMajorCourse,
        isCourseUpperDivision
    };
}
