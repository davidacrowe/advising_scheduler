// Main application logic for Biology Major Course Planner

// Application state
let appState = {
    studentName: '',
    startYear: null,      // Year of first Augsburg course
    startSemester: null,  // 'fall' or 'spring'
    semesterMapping: {},  // Maps semester IDs to actual terms (e.g., 'fall-1' -> 'FA24')
    draggedCourse: null,
    draggedFromSlot: null,
    useOldRules: false,   // Whether using pre-2025 Gen Ed rules
    majorType: 'biology', // 'biology' or 'biopsychology'
    auditData: null       // Stored audit data for reference
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initRequirementsState();
    populateSidebar();
    setupDragAndDrop();
    setupEventListeners();
    updateRequirementsUI();
});

// Populate the sidebar with course boxes
function populateSidebar() {
    // Intro courses
    const introContainer = document.getElementById('intro-courses');
    if (introContainer) {
        ['BIO151', 'BIO152'].forEach(id => {
            const course = getCourseById(id);
            if (course) {
                introContainer.appendChild(createCourseBox(course));
            }
        });
    }

    // Sophomore courses
    const sophContainer = document.getElementById('sophomore-courses');
    if (sophContainer) {
        ['BIO354', 'BIO355'].forEach(id => {
            const course = getCourseById(id);
            if (course) {
                sophContainer.appendChild(createCourseBox(course));
            }
        });
    }

    // Chemistry courses
    const chemContainer = document.getElementById('chemistry-courses');
    if (chemContainer) {
        CHEMISTRY_COURSES.forEach(course => {
            chemContainer.appendChild(createCourseBox(course));
        });
    }

    // Supporting courses (MAT114, Math, Physics) - exclude biopsych-only and hidden courses
    const supportContainer = document.getElementById('supporting-courses');
    if (supportContainer) {
        MATH_PHYSICS_COURSES
            .filter(course => !course.isBiopsychBioElective && !course.hideFromSidebar)
            .forEach(course => {
                supportContainer.appendChild(createCourseBox(course));
            });
    }

    // UD Electives
    const udContainer = document.getElementById('ud-elective-courses');
    if (udContainer) {
        const udElectives = getUDElectives();
        udElectives.forEach(course => {
            udContainer.appendChild(createCourseBox(course, true));
        });
    }

    // Keystone
    const keystoneContainer = document.getElementById('keystone-course');
    if (keystoneContainer) {
        const keystone = getCourseById('BIO490');
        if (keystone) {
            keystoneContainer.appendChild(createCourseBox(keystone));
        }
    }

    // Gen Ed courses with status indicators (NEW rules)
    const genedContainer = document.getElementById('gened-courses');
    if (genedContainer) {
        GENED_COURSES.forEach(course => {
            const item = document.createElement('div');
            item.className = 'gened-item';
            item.dataset.genedCategory = course.fulfills;

            // Status indicator
            const status = document.createElement('span');
            status.className = 'req-status';
            status.id = `gened-status-${course.fulfills}`;
            item.appendChild(status);

            // Course box
            const box = createCourseBox(course);
            item.appendChild(box);

            genedContainer.appendChild(item);
        });
    }

    // OLD Gen Ed courses with status indicators (OLD rules - pre-2025)
    const oldGenedContainer = document.getElementById('old-gened-courses');
    if (oldGenedContainer) {
        OLD_GENED_COURSES.forEach(course => {
            const item = document.createElement('div');
            item.className = 'gened-item';
            item.dataset.genedCategory = course.fulfills;
            item.dataset.oldGenEd = 'true';

            // Status indicator
            const status = document.createElement('span');
            status.className = 'req-status';
            status.id = `old-gened-status-${course.id}`;
            item.appendChild(status);

            // Course box
            const box = createCourseBox(course);
            item.appendChild(box);

            oldGenedContainer.appendChild(item);
        });
    }

    // Biopsychology Major - Required Courses
    const biopsychRequiredContainer = document.getElementById('biopsych-required-courses');
    if (biopsychRequiredContainer) {
        // BIO151, BIO152, BIO354, BIO475, CHM115, CHM116, PSY105, PSY215, PSY315, PSY355
        const requiredIds = ['BIO151', 'BIO152', 'BIO354', 'BIO475', 'CHM115', 'CHM116', 'PSY105', 'PSY215', 'PSY315', 'PSY355'];
        requiredIds.forEach(id => {
            const course = getCourseById(id);
            if (course) {
                biopsychRequiredContainer.appendChild(createCourseBox(course));
            }
        });
    }

    // Biopsychology Major - Biology Electives
    const biopsychBioElectContainer = document.getElementById('biopsych-bio-electives');
    if (biopsychBioElectContainer) {
        // BIO355, BIO369, BIO473, BIO474, PHY317
        const bioElectiveIds = ['BIO355', 'BIO369', 'BIO473', 'BIO474', 'PHY317'];
        bioElectiveIds.forEach(id => {
            const course = getCourseById(id);
            if (course) {
                biopsychBioElectContainer.appendChild(createCourseBox(course));
            }
        });
    }

    // Biopsychology Major - Psychology Electives
    const biopsychPsychElectContainer = document.getElementById('biopsych-psych-electives');
    if (biopsychPsychElectContainer) {
        // PSY253, PSY262, PSY299, PSY325, PSY354, PSY391, PSY410, PSY491
        const psychElectiveIds = ['PSY253', 'PSY262', 'PSY299', 'PSY325', 'PSY354', 'PSY391', 'PSY410', 'PSY491'];
        psychElectiveIds.forEach(id => {
            const course = getCourseById(id);
            if (course) {
                biopsychPsychElectContainer.appendChild(createCourseBox(course));
            }
        });
    }

    // Biopsychology Major - Keystone
    const biopsychKeystoneContainer = document.getElementById('biopsych-keystone-course');
    if (biopsychKeystoneContainer) {
        // BIO490 or PSY400
        ['BIO490', 'PSY400'].forEach(id => {
            const course = getCourseById(id);
            if (course) {
                biopsychKeystoneContainer.appendChild(createCourseBox(course));
            }
        });
    }

    // Minor courses
    const minorContainer = document.getElementById('minor-courses');
    if (minorContainer) {
        MINOR_COURSES.forEach(course => {
            minorContainer.appendChild(createCourseBox(course));
        });
    }

    // Generic courses
    const genericContainer = document.getElementById('generic-courses');
    if (genericContainer) {
        GENERIC_COURSES.forEach(course => {
            genericContainer.appendChild(createCourseBox(course));
        });
    }
}

// Create a course box element
function createCourseBox(course, showNonHealthMarker = false) {
    const box = document.createElement('div');
    box.className = `course-box ${course.category}`;
    box.draggable = true;
    box.dataset.courseId = course.id;
    box.dataset.credits = course.credits;

    // Set background color
    box.style.backgroundColor = course.color;

    // Text color based on background
    if (course.category === 'genEd' || course.category === 'generic') {
        box.style.color = '#333';
    }

    // Add border for generic courses
    if (course.category === 'generic') {
        box.style.border = '2px solid #ccc';
    }

    // Course name
    const nameSpan = document.createElement('span');
    nameSpan.className = 'course-name';
    nameSpan.textContent = course.nickname;
    box.appendChild(nameSpan);

    // Non-health marker
    if (showNonHealthMarker && course.isNonHealth) {
        const marker = document.createElement('span');
        marker.className = 'non-health-marker';
        marker.textContent = '\u2605'; // Star
        marker.title = 'Can fulfill non-health requirement';
        box.appendChild(marker);
    }

    // Credits badge
    const creditsBadge = document.createElement('span');
    creditsBadge.className = 'credits-badge';
    creditsBadge.textContent = `(${course.credits})`;
    box.appendChild(creditsBadge);

    // Add size class for 2-credit and 1-credit courses
    if (course.credits === 2) {
        box.classList.add('half-height');
    } else if (course.credits === 1) {
        box.classList.add('one-credit-box');
    }

    return box;
}

// Create a course box for placement in the grid
function createGridCourseBox(course, isCompleted = false, isInProgress = false, grade = null) {
    let modifiedCourse = course;

    // For biology majors, handle PSY courses based on their role
    if (appState.majorType !== 'biopsychology' && course.category === 'psychology') {
        // PSY215 fulfills the math/stats requirement - display as mathPhysics (red)
        if (course.id === 'PSY215') {
            modifiedCourse = {
                ...course,
                color: COLORS.mathPhysics,
                category: 'mathPhysics',
                nickname: 'Math'
            };
        } else {
            // Other PSY courses display as genEd (yellow) for biology majors
            modifiedCourse = { ...course, color: COLORS.genEd, category: 'genEd' };
        }
    }

    const box = createCourseBox(modifiedCourse);

    if (isCompleted) {
        box.classList.add('completed');
        box.draggable = false;
    } else if (isInProgress) {
        box.classList.add('in-progress');
        box.draggable = false;
    }

    if (grade) {
        box.title = `Grade: ${grade}`;
    }

    return box;
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    // Drag start on course boxes
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('course-box') && e.target.draggable) {
            appState.draggedCourse = e.target;
            appState.draggedFromSlot = e.target.closest('.slot');
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', e.target.dataset.courseId);

            // Hide any validation error when starting a new drag
            if (typeof hideValidationError === 'function') {
                hideValidationError();
            }
        }
    });

    // Drag end
    document.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('course-box')) {
            e.target.classList.remove('dragging');
            appState.draggedCourse = null;
            appState.draggedFromSlot = null;

            // Remove drag-over class from all slots
            document.querySelectorAll('.slot.drag-over').forEach(slot => {
                slot.classList.remove('drag-over');
            });
        }
    });

    // Drag over slots
    document.addEventListener('dragover', (e) => {
        const slot = e.target.closest('.slot');
        if (slot && appState.draggedCourse) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            // Check if slot can accept this course
            if (canAcceptCourse(slot, appState.draggedCourse)) {
                slot.classList.add('drag-over');
            }
        }
    });

    // Drag leave
    document.addEventListener('dragleave', (e) => {
        const slot = e.target.closest('.slot');
        if (slot) {
            slot.classList.remove('drag-over');
        }
    });

    // Drop
    document.addEventListener('drop', (e) => {
        const slot = e.target.closest('.slot');
        if (slot && appState.draggedCourse) {
            e.preventDefault();
            slot.classList.remove('drag-over');

            if (canAcceptCourse(slot, appState.draggedCourse)) {
                // Validate course placement before allowing drop
                const courseId = appState.draggedCourse.dataset.courseId;
                const semesterEl = slot.closest('.semester');
                const semesterId = semesterEl ? semesterEl.dataset.semester : null;

                // Validate placement if validation function exists
                if (semesterId && typeof validateCoursePlacement === 'function') {
                    const validation = validateCoursePlacement(courseId, semesterId);
                    if (!validation.valid) {
                        showValidationError(validation.message);
                        return; // Don't place the course
                    }
                }

                dropCourse(slot, appState.draggedCourse);
            }
        }

        // Drop back to sidebar (remove from grid)
        const sidebar = e.target.closest('.requirements-panel');
        if (sidebar && appState.draggedCourse && appState.draggedFromSlot) {
            e.preventDefault();
            removeCourseFromGrid(appState.draggedCourse);
        }
    });

    // Allow dropping on sidebar
    document.querySelector('.requirements-panel').addEventListener('dragover', (e) => {
        if (appState.draggedCourse && appState.draggedFromSlot) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }
    });
}

// Remove a course from the grid (drag back to sidebar)
function removeCourseFromGrid(courseBox) {
    const slot = courseBox.closest('.slot');
    const courseId = courseBox.dataset.courseId;
    const course = getCourseById(courseId, appState.useOldRules);

    // Remove from slot
    courseBox.remove();

    // Check if slot is now empty
    if (slot && slot.querySelectorAll('.course-box').length === 0) {
        slot.classList.remove('has-half');
    }

    // Update requirements
    if (course && course.replenishes) {
        // Subtract credits for replenishing courses (use dataset in case credits were customized)
        const credits = parseInt(courseBox.dataset.credits) || course.credits;
        requirementsState.totalCredits -= credits;
        if (course.isUpperDivision) {
            requirementsState.udCredits -= credits;
        }
    } else if (course) {
        removePlacedCourse(courseId);

        // Reactivate all matching sidebar courses (in visible sections)
        document.querySelectorAll(`.requirements-panel section:not(.hidden) .course-box[data-course-id="${courseId}"]`).forEach(sidebarCourse => {
            sidebarCourse.classList.remove('placed-in-grid');
            sidebarCourse.draggable = true;
        });

        // If it's a gen ed course, mark as not placed
        if (course.fulfills && course.category === 'genEd') {
            if (appState.useOldRules) {
                setOldGenEdPlaced(course.fulfills, false);
            } else {
                setGenEdPlaced(course.fulfills, false);
            }
        }
    }

    updateRequirementsUI();
}

// Check if a slot can accept a course
function canAcceptCourse(slot, courseBox) {
    const credits = parseInt(courseBox.dataset.credits);
    const isOneCredit = slot.classList.contains('one-credit');
    const isSummer = slot.classList.contains('summer-slot');

    // 1-credit slots only accept 1-credit courses
    if (isOneCredit && credits !== 1) {
        return false;
    }

    // Non-1-credit slots
    if (!isOneCredit) {
        // Check if slot is empty or can stack (for 2-credit courses)
        const existingCourses = slot.querySelectorAll('.course-box');

        if (credits <= 2) {
            // 2-credit courses can stack (max 2 courses totaling 4 credits)
            const existingCredits = Array.from(existingCourses).reduce((sum, box) => {
                return sum + parseInt(box.dataset.credits);
            }, 0);

            return existingCredits + credits <= 4;
        } else {
            // Full courses need empty slot
            return existingCourses.length === 0;
        }
    }

    // 1-credit slot - must be empty
    return slot.querySelectorAll('.course-box').length === 0;
}

// Drop a course into a slot
function dropCourse(slot, courseBox) {
    const courseId = courseBox.dataset.courseId;
    const semesterEl = slot.closest('.semester');
    const semester = semesterEl ? semesterEl.dataset.semester : null;
    const course = getCourseById(courseId, appState.useOldRules);

    // If dragged from sidebar (not from a slot)
    if (!appState.draggedFromSlot) {
        if (course && course.replenishes) {
            // Clone the course box for the grid (generic/minor courses)
            const newBox = createGridCourseBox(course);
            slot.appendChild(newBox);
            slot.classList.add('has-half');

            // Track credits for replenishing courses
            requirementsState.totalCredits += course.credits;
            if (course.isUpperDivision) {
                requirementsState.udCredits += course.credits;
            }
        } else {
            // Clone the course for the grid, mark sidebar as placed
            const newBox = createGridCourseBox(course);
            slot.appendChild(newBox);
            slot.classList.add('has-half');

            // Mark the sidebar course as placed (grayed out)
            courseBox.classList.add('placed-in-grid');
            courseBox.draggable = false;

            // Update requirements
            addPlacedCourse(courseId, semester);

            // If it's a gen ed course, mark as placed
            if (course && course.fulfills && course.category === 'genEd') {
                if (appState.useOldRules) {
                    setOldGenEdPlaced(course.fulfills, true);
                } else {
                    setGenEdPlaced(course.fulfills, true);
                }
            }
        }
    } else {
        // Moving from one slot to another
        const oldSemester = appState.draggedFromSlot.closest('.semester');
        const oldSemesterId = oldSemester ? oldSemester.dataset.semester : null;

        // Remove from old slot tracking (if applicable)
        if (appState.draggedFromSlot !== slot) {
            // Check if old slot is now empty
            if (appState.draggedFromSlot.querySelectorAll('.course-box').length <= 1) {
                appState.draggedFromSlot.classList.remove('has-half');
            }
        }

        // Move the box
        slot.appendChild(courseBox);
        slot.classList.add('has-half');

        // Update placement (semester changed)
        if (oldSemesterId !== semester) {
            requirementsState.placedCourses.set(courseId, { semester });
        }
    }

    updateRequirementsUI();
}

// Setup other event listeners
function setupEventListeners() {
    // File upload
    const fileInput = document.getElementById('audit-upload');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    // Expandable sections
    document.querySelectorAll('.expandable-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.expandable');
            const content = section.querySelector('.expandable-content');
            section.classList.toggle('expanded');
            content.classList.toggle('hidden');
        });
    });

    // Prior credits toggle
    const priorCreditsSection = document.getElementById('prior-credits');
    if (priorCreditsSection) {
        const header = priorCreditsSection.querySelector('h3');
        header.addEventListener('click', () => {
            priorCreditsSection.classList.toggle('expanded');
            const content = priorCreditsSection.querySelector('.prior-credits-content');
            content.classList.toggle('hidden');
        });
    }

    // Double-click handler for courses in slots
    document.addEventListener('dblclick', (e) => {
        const courseBox = e.target.closest('.course-box');
        if (courseBox && courseBox.closest('.slot') && !courseBox.classList.contains('completed') && !courseBox.classList.contains('in-progress')) {
            const courseId = courseBox.dataset.courseId;
            const course = getCourseById(courseId, appState.useOldRules);

            // Check if this is a generic or minor course that can be customized
            if (course && (course.isGeneric || course.isMinor) || courseId.startsWith('GENERIC-') || courseId.startsWith('MINOR-')) {
                // Open customization modal
                openCourseModal(courseBox);
            } else {
                // Regular course - remove from slot
                removeCourseFromSlot(courseBox);
            }
        }
    });

    // Setup modal event listeners
    setupModalListeners();
}

// Remove a course from its slot (used by double-click)
function removeCourseFromSlot(courseBox) {
    // Hide any validation error
    if (typeof hideValidationError === 'function') {
        hideValidationError();
    }

    const slot = courseBox.closest('.slot');
    const courseId = courseBox.dataset.courseId;
    const course = getCourseById(courseId, appState.useOldRules);

    // Remove from slot
    courseBox.remove();

    // Check if slot is now empty
    if (slot && slot.querySelectorAll('.course-box').length === 0) {
        slot.classList.remove('has-half');
    }

    // Update requirements
    if (course && course.replenishes) {
        // Subtract credits for replenishing courses (use dataset in case credits were customized)
        const credits = parseInt(courseBox.dataset.credits) || course.credits;
        requirementsState.totalCredits -= credits;
        if (course.isUpperDivision) {
            requirementsState.udCredits -= credits;
        }
    } else if (course) {
        removePlacedCourse(courseId);

        // Reactivate all matching sidebar courses (in visible sections)
        document.querySelectorAll(`.requirements-panel section:not(.hidden) .course-box[data-course-id="${courseId}"]`).forEach(sidebarCourse => {
            sidebarCourse.classList.remove('placed-in-grid');
            sidebarCourse.draggable = true;
        });

        // If it's a gen ed course, mark as not placed
        if (course.fulfills && course.category === 'genEd') {
            if (appState.useOldRules) {
                setOldGenEdPlaced(course.fulfills, false);
            } else {
                setGenEdPlaced(course.fulfills, false);
            }
        }
    }

    updateRequirementsUI();
}

// Handle file upload
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
    }

    try {
        const auditData = await parseAuditPDF(file);
        loadAuditData(auditData);
    } catch (error) {
        console.error('Error parsing PDF:', error);
        alert('Error parsing the degree audit. Please try again.');
    }
}

// Load parsed audit data into the application
function loadAuditData(auditData) {
    // Hide any validation error from previous session
    if (typeof hideValidationError === 'function') {
        hideValidationError();
    }

    // Reset state
    initRequirementsState();
    clearGrid();
    resetSidebar();

    // Store audit data for later reference
    appState.auditData = auditData;

    // Set student name
    appState.studentName = auditData.studentName || '';
    document.getElementById('student-name').textContent = appState.studentName;

    // Store which rules to use
    appState.useOldRules = auditData.useOldRules || false;
    setUseOldRules(appState.useOldRules);
    // Store major type and switch display
    appState.majorType = auditData.majorType || 'biology';
    switchMajorDisplay(appState.majorType);

    // Show/hide appropriate Gen Ed sections
    switchGenEdDisplay(appState.useOldRules);

    // Set special flags
    setAugsburgExperience(auditData.augsburgExperience || false);
    setIntentToGraduate(auditData.intentToGraduate || false);
    setMPG4(auditData.hasMPG4 || false);
    setKeystoneComplete(auditData.keystoneComplete || false);

    // Set gen ed completion status based on rules
    if (appState.useOldRules) {
        // Old rules - set old gen ed status
        if (auditData.oldGenEdStatus) {
            Object.entries(auditData.oldGenEdStatus).forEach(([category, statusObj]) => {
                setOldGenEdComplete(category, statusObj);
            });
        }
    } else {
        // New rules - set gen ed completion status
        if (auditData.genEdStatus) {
            Object.entries(auditData.genEdStatus).forEach(([category, statusObj]) => {
                setGenEdComplete(category, statusObj.complete);
            });
        }
    }

    // Find the first semester with any Augsburg course (FA or SP term) to establish Year 1
    // This handles students who transfer in BIO151/152 or start with other courses
    let firstAugsburgSemester = null;
    auditData.courses.forEach(courseData => {
        // Look for regular Augsburg terms (FA or SP), not transfer terms (TU, TF, TS, T1, T2, T3, AC)
        if (!firstAugsburgSemester && /^(FA|SP)\d{2}$/i.test(courseData.term)) {
            firstAugsburgSemester = courseData.term;
        }
    });

    // Calculate semester mapping
    if (firstAugsburgSemester) {
        calculateSemesterMapping(firstAugsburgSemester);
    }

    // Collect transfer courses that occurred before the grid start
    const priorTransferCourses = [];
    if (firstAugsburgSemester) {
        const gridStartDate = termToDate(firstAugsburgSemester);
        auditData.courses.forEach(courseData => {
            // Check if this is a transfer course (T-prefixed term or AC)
            if (/^(T1|T2|T3|TU|TF|TS|AC)\d{2}$/i.test(courseData.term)) {
                const courseDate = termToDate(courseData.term);
                // If before grid start, add to prior transfer
                if (courseDate < gridStartDate) {
                    priorTransferCourses.push({
                        courseId: courseData.courseId,
                        credits: courseData.credits,
                        term: courseData.term,
                        grade: courseData.grade,
                        fulfills: courseData.genEdCategory || ''
                    });
                }
            }
        });
    }

    // Place completed courses in grid
    auditData.courses.forEach(courseData => {
        const { courseId, term, credits, grade, genEdCategory } = courseData;

        // Add to requirements tracking
        addCompletedCourse(courseId, term, grade, credits);

        // Place in grid (pass full courseData for gen ed info)
        placeCourseInGrid(courseData);
    });

    // Display minor name and place minor courses in grid
    const minorNameEl = document.getElementById('minor-name');
    if (auditData.minorName) {
        if (minorNameEl) {
            minorNameEl.textContent = `(${auditData.minorName})`;
        }
    } else {
        if (minorNameEl) {
            minorNameEl.textContent = '';
        }
    }

    if (auditData.minorCourses && auditData.minorCourses.length > 0) {
        auditData.minorCourses.forEach(courseData => {
            // Check if this course is already placed in the grid (not just in courses array)
            const existingInGrid = document.querySelector(`.slot .course-box[data-course-id="${courseData.courseId}"]`);
            if (!existingInGrid) {
                placeMinorCourseInGrid(courseData, auditData.minorName);
            }
        });
    }

    // Gray out sidebar Gen Ed placeholders for completed/partial categories
    if (appState.useOldRules) {
        // Old rules - gray out completed old gen ed courses
        // Also handle partial completion (e.g., Fine Arts with 1 of 2 courses)
        if (auditData.oldGenEdStatus) {
            Object.entries(auditData.oldGenEdStatus).forEach(([category, statusObj]) => {
                const haveCount = statusObj.have || 0;
                const courseBoxes = document.querySelectorAll(`#old-gened-courses .gened-item[data-gened-category="${category}"] .course-box`);

                courseBoxes.forEach((sidebarGenEd, index) => {
                    // Gray out if complete OR if this slot is within the 'have' count
                    if (statusObj.complete || index < haveCount) {
                        if (!sidebarGenEd.classList.contains('placed-in-grid')) {
                            sidebarGenEd.classList.add('placed-in-grid');
                            sidebarGenEd.draggable = false;
                        }
                    }
                });
            });
        }
    } else {
        // New rules - gray out completed gen ed courses
        if (auditData.genEdStatus) {
            Object.entries(auditData.genEdStatus).forEach(([category, statusObj]) => {
                if (statusObj.complete) {
                    const sidebarGenEd = document.querySelector(`#gened-courses .gened-item[data-gened-category="${category}"] .course-box`);
                    if (sidebarGenEd && !sidebarGenEd.classList.contains('placed-in-grid')) {
                        sidebarGenEd.classList.add('placed-in-grid');
                        sidebarGenEd.draggable = false;
                    }
                }
            });
        }
    }

    // Display prior transfer courses (those before grid start)
    if (priorTransferCourses.length > 0) {
        displayPriorCredits(priorTransferCourses);
    }

    // Override credit counts with parsed values from audit (more accurate)
    if (auditData.totalCreditsEarned > 0 || auditData.totalCreditsInProgress > 0) {
        setTotalCredits(auditData.totalCreditsEarned, auditData.totalCreditsInProgress || 0);
    }
    if (auditData.udCreditsEarned > 0 || auditData.udCreditsInProgress > 0) {
        setUdCredits(auditData.udCreditsEarned, auditData.udCreditsInProgress || 0);
    }

    updateRequirementsUI();
}

// Switch between old and new Gen Ed display sections
function switchGenEdDisplay(useOldRules) {
    const newSection = document.getElementById('gened-new-section');
    const oldSection = document.getElementById('gened-old-section');

    if (useOldRules) {
        newSection?.classList.add('hidden');
        oldSection?.classList.remove('hidden');
    } else {
        newSection?.classList.remove('hidden');
        oldSection?.classList.add('hidden');
    }
}

// Switch between Biology and Biopsychology major display sections
function switchMajorDisplay(majorType) {
    const bioSection = document.getElementById('bio-major-section');
    const biopsychSection = document.getElementById('biopsych-major-section');
    const appTitle = document.getElementById('app-title');

    if (majorType === 'biopsychology') {
        bioSection?.classList.add('hidden');
        biopsychSection?.classList.remove('hidden');
        if (appTitle) appTitle.textContent = 'Biopsychology Major Course Planner';
    } else {
        bioSection?.classList.remove('hidden');
        biopsychSection?.classList.add('hidden');
        if (appTitle) appTitle.textContent = 'Biology Major Course Planner';
    }
}

// Calculate semester mapping based on first Bio course
function calculateSemesterMapping(firstBioTerm) {
    // Parse term (e.g., 'FA24' -> Fall 2024, 'SP25' -> Spring 2025)
    const termMatch = firstBioTerm.match(/^(FA|SP|SU)(\d{2})$/i);
    if (!termMatch) {
        // Use current academic year as fallback
        const now = new Date();
        appState.startYear = now.getFullYear();
        appState.startSemester = 'fall';
    } else {
        const [, season, yearStr] = termMatch;
        const year = 2000 + parseInt(yearStr);

        appState.startYear = year;
        appState.startSemester = season.toUpperCase() === 'FA' ? 'fall' : 'spring';
    }

    // Build mapping
    // If first bio course is in Spring, Year 1 starts with the Fall BEFORE that Spring
    // If first bio course is in Fall, Year 1 starts with that Fall

    let baseYear = appState.startYear;

    if (appState.startSemester === 'spring') {
        // Spring 2025 means Year 1 is FA24-SP25
        // So baseYear for fall-1 is 2024 (one year before spring year)
        baseYear = appState.startYear - 1;
    }

    for (let yearNum = 1; yearNum <= 4; yearNum++) {
        const fallYear = baseYear + yearNum - 1;
        const springYear = fallYear + 1;

        appState.semesterMapping[`fall-${yearNum}`] = `FA${fallYear.toString().slice(-2)}`;
        appState.semesterMapping[`spring-${yearNum}`] = `SP${springYear.toString().slice(-2)}`;
        appState.semesterMapping[`summer-${yearNum}`] = `SU${springYear.toString().slice(-2)}`;
    }

    // Update semester labels in UI
    updateSemesterLabels();
}

// Update semester labels in the grid
function updateSemesterLabels() {
    document.querySelectorAll('.semester').forEach(semesterEl => {
        const semesterId = semesterEl.dataset.semester;
        const label = semesterEl.querySelector('.semester-label');
        const term = appState.semesterMapping[semesterId];

        if (label && term) {
            // Convert FA24 to "Fall 2024"
            const match = term.match(/^(FA|SP|SU)(\d{2})$/);
            if (match) {
                const [, season, yearStr] = match;
                const year = 2000 + parseInt(yearStr);
                const seasonName = season === 'FA' ? 'Fall' : season === 'SP' ? 'Spring' : 'Sum';
                label.textContent = `${seasonName} ${year}`;
            }
        }
    });
}

// Place a course in the appropriate grid slot
function placeCourseInGrid(courseData) {
    const { courseId, term, grade, credits: auditCredits, genEdCategory } = courseData;

    // Find the semester element matching this term
    const semesterId = Object.entries(appState.semesterMapping)
        .find(([id, t]) => t === term)?.[0];

    if (!semesterId) {
        // Term doesn't fit in grid - add to prior credits
        return false;
    }

    const semesterEl = document.querySelector(`[data-semester="${semesterId}"]`);
    if (!semesterEl) return false;

    // Check if this course is a minor course - if so, let minor placement handle it (as purple)
    // Exception: if the course is specifically fulfilling a Gen Ed or Major requirement
    const isMinorCourse = appState.auditData?.minorCourses?.some(mc => mc.courseId === courseId);

    if (isMinorCourse) {
        // Check if this course fulfills a major requirement (mathStats or physics)
        const mathStatsCourses = ['MAT145', 'MAT163', 'DST164', 'PSY215'];
        const physicsCourses = ['PHY107', 'PHY116', 'PHY121'];
        const isNeededForMajor = mathStatsCourses.includes(courseId) || physicsCourses.includes(courseId);

        // Check if this course is actually needed for a Gen Ed (appears in genEdStatus courses)
        let isNeededForGenEd = false;
        if (genEdCategory) {
            const genEdStatus = appState.useOldRules
                ? appState.auditData?.oldGenEdStatus?.[genEdCategory]
                : appState.auditData?.genEdStatus?.[genEdCategory];
            // Only treat as Gen Ed if this specific course is listed in that category's courses
            isNeededForGenEd = genEdStatus?.courses?.some(c => c.courseId === courseId);
        }

        if (!isNeededForGenEd && !isNeededForMajor) {
            return false;
        }
    }

    // Get course info from our defined courses
    let course = getCourseById(courseId, appState.useOldRules);

    // If course not found but has a gen ed category, create a dynamic gen ed course
    if (!course && genEdCategory) {
        course = createDynamicGenEdCourse(courseId, auditCredits, genEdCategory);
    }

    if (!course) {
        // Create a dynamic elective course for unknown courses so they appear in the grid
        course = {
            id: courseId,
            name: courseId,
            credits: auditCredits || 4,
            type: 'elective'
        };
    }

    // Find an available slot
    const isInProgress = grade === 'IP' || grade === 'In-P';
    const isCompleted = !isInProgress;
    const courseBox = createGridCourseBox(course, isCompleted, isInProgress, grade);

    // Determine slot type needed
    const credits = course.credits;
    let targetSlot = null;

    if (credits === 1) {
        // Find empty 1-credit slot
        targetSlot = semesterEl.querySelector('.one-credit:empty');
    } else {
        // Find empty or stackable regular slot
        const slots = semesterEl.querySelectorAll('.slot.full, .slot.summer-slot');
        for (const slot of slots) {
            if (canAcceptCourse(slot, courseBox)) {
                targetSlot = slot;
                break;
            }
        }
    }

    if (targetSlot) {
        targetSlot.appendChild(courseBox);
        if (credits <= 2) {
            targetSlot.classList.add('has-half');
        }

        // If this is a gen ed course, check if the section is complete before graying sidebar
        if (genEdCategory) {
            // Check if this gen ed is actually complete according to the audit
            let isGenEdComplete = false;
            if (appState.useOldRules) {
                const statusObj = appState.auditData?.oldGenEdStatus?.[genEdCategory];
                isGenEdComplete = statusObj?.complete || false;
            } else {
                const statusObj = appState.auditData?.genEdStatus?.[genEdCategory];
                isGenEdComplete = statusObj?.complete || false;
                if (isGenEdComplete) {
                    setGenEdComplete(genEdCategory, true);
                }
            }

            // Only gray out sidebar if the gen ed is actually complete
            if (isGenEdComplete) {
                const container = appState.useOldRules ? '#old-gened-courses' : '#gened-courses';
                document.querySelectorAll(`${container} .gened-item[data-gened-category="${genEdCategory}"] .course-box`).forEach(sidebarGenEd => {
                    if (!sidebarGenEd.classList.contains('placed-in-grid')) {
                        sidebarGenEd.classList.add('placed-in-grid');
                        sidebarGenEd.draggable = false;
                    }
                });
            }
        }

        return true;
    }

    return false;
}

// Create a dynamic course object for gen ed courses from the audit
function createDynamicGenEdCourse(courseId, credits, genEdCategory) {
    // Map gen ed category to display name (includes both new and old categories)
    const categoryNames = {
        // New rules (2025+)
        writing: 'Writing',
        math: 'Math',
        sustWell: 'Sust/Well',
        communication: 'Comm',
        localGlobal: 'Local/Global',
        epsj: 'EPSJ',
        lab: 'Lab Science',
        art: 'Arts',
        religion: 'Religion',
        behavioral: 'Behavioral',
        humanities: 'Humanities',
        // Old rules (pre-2025)
        effectiveWriting: 'Eff Writing',
        modernLanguage: 'Mod Lang',
        wellness: 'Wellness',
        searchMeaning1: 'Search I',
        searchMeaning2: 'Search II',
        sciMathLAF: 'Sci/Math',
        socialBehavLAF: 'Soc/Beh',
        fineArtsLAF: 'Fine Arts',
        humanitiesLAF: 'Humanities'
    };

    return {
        id: courseId,
        name: courseId,
        nickname: courseId,  // Use actual course ID as nickname (e.g., "ENL111")
        credits: credits || 4,
        category: 'genEd',
        color: COLORS.genEd,
        fulfills: genEdCategory,
        isDynamic: true  // Flag to identify dynamically created courses
    };
}

// Place a minor course in the appropriate grid slot
function placeMinorCourseInGrid(courseData, minorName) {
    const { courseId, term, grade, credits } = courseData;

    // Find the semester element matching this term
    const semesterId = Object.entries(appState.semesterMapping)
        .find(([id, t]) => t === term)?.[0];

    if (!semesterId) {
        return false;
    }

    const semesterEl = document.querySelector(`[data-semester="${semesterId}"]`);
    if (!semesterEl) return false;

    // Create a dynamic minor course object
    const course = {
        id: courseId,
        name: courseId,
        nickname: courseId,
        credits: credits || 4,
        category: 'minor',
        color: COLORS.minor,
        isMinor: true
    };

    // Create course box
    const isInProgress = grade === 'IP' || grade === 'In-P';
    const isCompleted = !isInProgress;
    const courseBox = createGridCourseBox(course, isCompleted, isInProgress, grade);

    // Mark as a minor course
    courseBox.dataset.isMinor = 'true';
    courseBox.dataset.minorName = minorName || '';
    courseBox.title = `${courseId} - ${minorName || 'Minor'}${grade ? ` (Grade: ${grade})` : ''}`;

    // Find an available slot
    let targetSlot = null;

    if (credits === 1) {
        targetSlot = semesterEl.querySelector('.one-credit:empty');
    } else {
        const slots = semesterEl.querySelectorAll('.slot.full, .slot.summer-slot');
        for (const slot of slots) {
            if (canAcceptCourse(slot, courseBox)) {
                targetSlot = slot;
                break;
            }
        }
    }

    if (targetSlot) {
        targetSlot.appendChild(courseBox);
        if (credits <= 2) {
            targetSlot.classList.add('has-half');
        }
        return true;
    }

    return false;
}

// Clear all courses from the grid
function clearGrid() {
    document.querySelectorAll('.slot .course-box').forEach(box => box.remove());
    document.querySelectorAll('.slot').forEach(slot => slot.classList.remove('has-half'));
    document.getElementById('prior-credits-list').innerHTML = '';
}

// Reset all sidebar course boxes to default state
function resetSidebar() {
    document.querySelectorAll('.requirements-panel .course-box').forEach(box => {
        box.classList.remove('placed-in-grid', 'used');
        box.draggable = true;
    });
}

// Display prior transfer courses (those taken before grid start)
function displayPriorCredits(priorCredits) {
    const container = document.getElementById('prior-credits-list');
    if (!container) return;

    // Clear any existing items
    container.innerHTML = '';

    priorCredits.forEach(credit => {
        const item = document.createElement('div');

        // Determine the category based on course ID prefix or fulfills field
        const category = getCourseCategory(credit.courseId, credit.fulfills);
        item.className = `prior-credit-item prior-credit-${category}`;

        item.innerHTML = `
            <span class="course-name">${credit.courseId}</span>
            <span class="term">${credit.term || ''}</span>
            <span class="credits">${credit.credits} cr</span>
            <span class="fulfills">${credit.fulfills || ''}</span>
        `;
        container.appendChild(item);
    });

    // Show the section if there are prior credits
    if (priorCredits.length > 0) {
        document.getElementById('prior-credits').style.display = 'block';
    }
}

// Determine course category from course ID and optional fulfills field
function getCourseCategory(courseId, fulfills = '') {
    // First try to find the course in the database
    const course = getCourseById(courseId, appState.useOldRules);
    if (course && course.category) {
        return course.category;
    }

    // Fall back to prefix-based detection
    const id = courseId.toUpperCase();
    if (id.startsWith('BIO')) return 'biology';
    if (id.startsWith('CHM') || id.startsWith('CHEM')) return 'chemistry';
    if (id.startsWith('MAT') || id.startsWith('MATH')) return 'mathPhysics';
    if (id.startsWith('PHY') || id.startsWith('PHYS')) return 'mathPhysics';
    if (id.startsWith('PSY')) return 'psychology';

    // Check if it fulfills a Gen Ed requirement
    if (fulfills && fulfills.length > 0) {
        return 'genEd';
    }

    return 'generic';
}

// Utility function to parse term code to date for sorting
function termToDate(term) {
    const match = term.match(/^(FA|SP|SU|T1|T2|T3|TU|TF|TS)(\d{2})$/);
    if (!match) return new Date(0);

    const [, season, yearStr] = match;
    const year = 2000 + parseInt(yearStr);

    // Assign month based on season for sorting
    let month;
    switch (season) {
        case 'SP':
        case 'T2':
        case 'TS':
            month = 1; // January (Spring semester)
            break;
        case 'SU':
        case 'T3':
        case 'TU':
            month = 5; // May (Summer)
            break;
        case 'FA':
        case 'T1':
        case 'TF':
        default:
            month = 8; // August (Fall semester)
            break;
    }

    return new Date(year, month, 1);
}

// ============ Course Customization Modal ============

let currentEditingCourse = null;

// Setup modal event listeners
function setupModalListeners() {
    const modal = document.getElementById('course-modal');
    const form = document.getElementById('course-form');
    const cancelBtn = document.getElementById('modal-cancel');

    // Cancel button closes modal
    cancelBtn.addEventListener('click', closeModal);

    // Click outside modal closes it
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCourseCustomization();
    });
}

// Open the course customization modal
function openCourseModal(courseBox) {
    currentEditingCourse = courseBox;
    const modal = document.getElementById('course-modal');

    // Pre-fill form with current values if course was already customized
    const nameInput = document.getElementById('course-name');
    const creditsSelect = document.getElementById('course-credits');
    const typeSelect = document.getElementById('course-type');

    // Check if course has custom data
    if (courseBox.dataset.customName) {
        nameInput.value = courseBox.dataset.customName;
    } else {
        nameInput.value = '';
    }

    // Set credits from the course box
    const credits = courseBox.dataset.credits || '4';
    creditsSelect.value = credits;

    // Set type based on current category or custom type
    if (courseBox.dataset.customType) {
        typeSelect.value = courseBox.dataset.customType;
    } else if (courseBox.dataset.courseId.startsWith('MINOR-')) {
        typeSelect.value = 'minor';
    } else {
        typeSelect.value = 'elective';
    }

    // Show modal
    modal.classList.remove('hidden');
    nameInput.focus();
}

// Close the modal
function closeModal() {
    const modal = document.getElementById('course-modal');
    modal.classList.add('hidden');
    currentEditingCourse = null;
}

// Save course customization
function saveCourseCustomization() {
    if (!currentEditingCourse) return;

    const nameInput = document.getElementById('course-name');
    const creditsSelect = document.getElementById('course-credits');
    const typeSelect = document.getElementById('course-type');

    const name = nameInput.value.trim() || 'Custom';
    const newCredits = parseInt(creditsSelect.value);
    const type = typeSelect.value;

    // Adjust credit totals if credits changed
    const oldCredits = parseInt(currentEditingCourse.dataset.credits) || 0;
    if (newCredits !== oldCredits) {
        requirementsState.totalCredits += (newCredits - oldCredits);
    }

    // Update the course box
    updateCourseBox(currentEditingCourse, name, newCredits, type);

    closeModal();
    updateRequirementsUI();
}

// Update a course box with custom values
function updateCourseBox(courseBox, name, credits, type) {
    // Store custom data
    courseBox.dataset.customName = name;
    courseBox.dataset.customType = type;
    courseBox.dataset.credits = credits;

    // Update display
    const nameSpan = courseBox.querySelector('.course-name');
    const creditsBadge = courseBox.querySelector('.credits-badge');

    if (nameSpan) nameSpan.textContent = name;
    if (creditsBadge) creditsBadge.textContent = `(${credits})`;

    // Remove old category classes
    courseBox.classList.remove('generic', 'minor', 'biology', 'major-elective');

    // Apply new styling based on type
    switch (type) {
        case 'major':
            courseBox.classList.add('major-elective');
            courseBox.style.backgroundColor = COLORS.biology;
            courseBox.style.color = 'white';
            courseBox.style.border = '1px solid rgba(0, 0, 0, 0.1)';
            break;
        case 'minor':
            courseBox.classList.add('minor');
            courseBox.style.backgroundColor = COLORS.minor;
            courseBox.style.color = '#333';
            courseBox.style.border = '1px solid rgba(0, 0, 0, 0.1)';
            break;
        case 'elective':
        default:
            courseBox.classList.add('generic');
            courseBox.style.backgroundColor = COLORS.generic;
            courseBox.style.color = '#333';
            courseBox.style.border = '2px solid #ccc';
            break;
    }

    // Mark as customized
    courseBox.classList.add('customized');

    // Update size class based on new credits
    courseBox.classList.remove('half-height', 'one-credit-box');
    if (credits === 2) {
        courseBox.classList.add('half-height');
    } else if (credits === 1) {
        courseBox.classList.add('one-credit-box');
    }
}
