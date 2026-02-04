// Requirements checking logic for Biology Major

// Requirement definitions
const REQUIREMENTS = {
    // Credit requirements
    totalCredits: {
        target: 128,
        type: 'minimum'
    },
    udCredits: {
        target: 36,
        type: 'minimum'
    },
    plpTotal: {
        target: 24,
        type: 'maximum'
    },
    plpMajor: {
        target: 8,
        type: 'maximum'
    },

    // Biology Major requirements
    bioMajor: {
        introSequence: ['BIO151', 'BIO152'],
        sophomoreLevel: ['BIO354', 'BIO355'],
        chemistry: ['CHM115', 'CHM116', 'CHM251'],
        precalc: ['MAT114'],
        mathStats: ['MAT145', 'MAT163', 'DST164', 'PSY215'], // One of these
        physics: ['PHY107', 'PHY116', 'PHY121'], // One of these
        keystone: ['BIO490'],
        udElectives: 5, // Total needed
        udWithLab: 4,   // Minimum with lab
        nonHealth: 1    // At least one from the non-health list
    },

    // Non-health courses (can fulfill the diversity requirement)
    nonHealthCourses: ['BIO361', 'BIO420', 'BIO444', 'BIO481', 'ENV320'],

    // Gen Ed requirements - NEW rules (2025+ catalog years)
    genEd: {
        writing: { required: true },
        math: { required: true },
        sustWell: { required: true },
        communication: { required: true },
        localGlobal: { required: true },
        epsj: { required: true },
        lab: { required: true },
        art: { required: true },
        religion: { required: true },
        behavioral: { required: true },
        humanities: { required: true }
    },

    // Gen Ed requirements - OLD rules (pre-2025 catalog years)
    oldGenEd: {
        effectiveWriting: { required: 1 },   // 1 course (usually ENL111)
        modernLanguage: { required: 2 },      // 2 courses
        wellness: { required: 2 },            // 2 x 1-credit courses
        searchMeaning1: { required: 1 },      // 1 course (usually REL100)
        searchMeaning2: { required: 1 },      // 1 course
        sciMathLAF: { required: 2 },          // 2 courses, 2 depts, 1 lab (Bio majors fulfill with major)
        socialBehavLAF: { required: 2 },      // 2 courses from 2 depts
        fineArtsLAF: { required: 2 },         // 2 courses from 2 depts
        humanitiesLAF: { required: 2 }        // 2 courses from 2 depts
    }
};

// State object to track current requirements status
let requirementsState = {
    // Credits
    totalCredits: 0,
    totalCreditsInProgress: 0,
    udCredits: 0,
    udCreditsInProgress: 0,
    plpTotal: 0,
    plpMajor: 0,

    // Special flags
    augsburgExperience: false,
    intentToGraduate: false,
    hasMPG4: false,           // True if student achieved MPG4 on math placement test

    // Courses placed/completed
    completedCourses: new Map(), // courseId -> {semester, grade, credits, isCompleted, isInProgress}
    placedCourses: new Map(),    // courseId -> {semester}

    // UD elective tracking
    udElectivesPlaced: [],
    udElectivesWithLab: 0,
    nonHealthPlaced: 0,

    // Gen Ed tracking (using our category names)
    genEdCompleted: {
        writing: false,
        math: false,
        sustWell: false,
        communication: false,
        localGlobal: false,
        epsj: false,
        lab: false,
        art: false,
        religion: false,
        behavioral: false,
        humanities: false
    },

    // Gen Ed placed by user (not from audit)
    genEdPlaced: {
        writing: false,
        math: false,
        sustWell: false,
        communication: false,
        localGlobal: false,
        epsj: false,
        lab: false,
        art: false,
        religion: false,
        behavioral: false,
        humanities: false
    },

    // Old Gen Ed tracking (pre-2025 rules)
    useOldRules: false,
    oldGenEdCompleted: {
        effectiveWriting: { complete: false, have: 0 },
        modernLanguage: { complete: false, have: 0 },
        wellness: { complete: false, have: 0 },
        searchMeaning1: { complete: false, have: 0 },
        searchMeaning2: { complete: false, have: 0 },
        sciMathLAF: { complete: false, have: 0 },
        socialBehavLAF: { complete: false, have: 0 },
        fineArtsLAF: { complete: false, have: 0 },
        humanitiesLAF: { complete: false, have: 0 }
    },
    oldGenEdPlaced: {
        effectiveWriting: { have: 0 },
        modernLanguage: { have: 0 },
        wellness: { have: 0 },
        searchMeaning1: { have: 0 },
        searchMeaning2: { have: 0 },
        sciMathLAF: { have: 0 },
        socialBehavLAF: { have: 0 },
        fineArtsLAF: { have: 0 },
        humanitiesLAF: { have: 0 }
    },
    // Flexible keystone tracking
    keystoneComplete: false
};

// Initialize requirements state
function initRequirementsState() {
    requirementsState = {
        totalCredits: 0,
        totalCreditsInProgress: 0,
        udCredits: 0,
        udCreditsInProgress: 0,
        plpTotal: 0,
        plpMajor: 0,
        augsburgExperience: false,
        intentToGraduate: false,
        hasMPG4: false,
        completedCourses: new Map(),
        placedCourses: new Map(),
        udElectivesPlaced: [],
        udElectivesWithLab: 0,
        nonHealthPlaced: 0,
        genEdCompleted: {
            writing: false,
            math: false,
            sustWell: false,
            communication: false,
            localGlobal: false,
            epsj: false,
            lab: false,
            art: false,
            religion: false,
            behavioral: false,
            humanities: false
        },
        genEdPlaced: {
            writing: false,
            math: false,
            sustWell: false,
            communication: false,
            localGlobal: false,
            epsj: false,
            lab: false,
            art: false,
            religion: false,
            behavioral: false,
            humanities: false
        },
        useOldRules: false,
        oldGenEdCompleted: {
            effectiveWriting: { complete: false, have: 0 },
            modernLanguage: { complete: false, have: 0 },
            wellness: { complete: false, have: 0 },
            searchMeaning1: { complete: false, have: 0 },
            searchMeaning2: { complete: false, have: 0 },
            sciMathLAF: { complete: false, have: 0 },
            socialBehavLAF: { complete: false, have: 0 },
            fineArtsLAF: { complete: false, have: 0 },
            humanitiesLAF: { complete: false, have: 0 }
        },
        oldGenEdPlaced: {
            effectiveWriting: { have: 0 },
            modernLanguage: { have: 0 },
            wellness: { have: 0 },
            searchMeaning1: { have: 0 },
            searchMeaning2: { have: 0 },
            sciMathLAF: { have: 0 },
            socialBehavLAF: { have: 0 },
            fineArtsLAF: { have: 0 },
            humanitiesLAF: { have: 0 }
        },
        // Biopsychology major tracking
        biopsychBioElectives: 0,
        biopsychPsychElectives: 0,
        biopsychKeystone: 0,
        // Flexible keystone tracking (for non-standard approved keystones)
        keystoneComplete: false
    };
}

// Check if a course is a major course (for P/LP tracking)
function isMajorCourse(courseId) {
    const majorCourseIds = [
        'BIO151', 'BIO152', 'BIO354', 'BIO355',
        'BIO320', 'BIO361', 'BIO369', 'BIO370', 'BIO420',
        'BIO444', 'BIO473', 'BIO474', 'BIO475', 'BIO476',
        'BIO481', 'BIO485', 'BIO486', 'BIO490',
        'CHM115', 'CHM116', 'CHM251',
        'MAT114', 'MAT145', 'MAT163', 'DST164',
        'PHY107', 'PHY116', 'PHY121', 'PSY215'
    ];
    return majorCourseIds.includes(courseId.replace(/L$/, ''));
}

// Check if grade is P/LP
function isPLPGrade(grade) {
    return grade === 'P' || grade === 'LP';
}

// Check if course is upper division
function isUpperDivision(courseId) {
    const match = courseId.match(/\d{3}/);
    if (match) {
        const number = parseInt(match[0]);
        return number >= 300 && number < 500;
    }
    return false;
}

// Add a completed course from audit
function addCompletedCourse(courseId, semester, grade, credits) {
    const baseId = courseId.replace(/L$/, '');

    // Skip lab entries (we count them with the main course)
    if (courseId.endsWith('L') && requirementsState.completedCourses.has(baseId)) {
        return;
    }

    const isInProgress = grade === 'IP' || grade === 'In-P' || grade === 'IN-P';

    requirementsState.completedCourses.set(baseId, {
        semester,
        grade,
        credits,
        isCompleted: !isInProgress,
        isInProgress
    });

    // Update credit counts
    requirementsState.totalCredits += credits;

    if (isUpperDivision(baseId)) {
        requirementsState.udCredits += credits;
    }

    if (isPLPGrade(grade)) {
        requirementsState.plpTotal += credits;
        if (isMajorCourse(baseId)) {
            requirementsState.plpMajor += credits;
        }
    }

    // Check for UD electives
    const course = getCourseById(baseId);
    if (course && course.isUpperDivision && !course.isRequired && !course.isKeystone) {
        if (!['BIO354', 'BIO355'].includes(baseId)) {
            requirementsState.udElectivesPlaced.push(baseId);
            if (course.hasLab) {
                requirementsState.udElectivesWithLab++;
            }
            if (course.isNonHealth) {
                requirementsState.nonHealthPlaced++;
            }
        }
    }

    // Track biopsychology electives (constants defined below)
    if (typeof BIOPSYCH_BIO_ELECTIVES !== 'undefined') {
        if (BIOPSYCH_BIO_ELECTIVES.includes(baseId)) {
            requirementsState.biopsychBioElectives++;
        }
        if (BIOPSYCH_PSYCH_ELECTIVES.includes(baseId)) {
            requirementsState.biopsychPsychElectives++;
        }
        if (BIOPSYCH_KEYSTONES.includes(baseId)) {
            requirementsState.biopsychKeystone++;
        }
    }
}

// Biopsychology elective course IDs
const BIOPSYCH_BIO_ELECTIVES = ['BIO355', 'BIO369', 'BIO473', 'BIO474', 'PHY317'];
const BIOPSYCH_PSYCH_ELECTIVES = ['PSY253', 'PSY262', 'PSY299', 'PSY325', 'PSY354', 'PSY391', 'PSY410', 'PSY491'];
const BIOPSYCH_KEYSTONES = ['BIO490', 'PSY400'];

// Add a placed course (from drag-drop)
function addPlacedCourse(courseId, semester) {
    const baseId = courseId.replace(/L$/, '');

    // Don't add if already completed
    if (requirementsState.completedCourses.has(baseId)) {
        return false;
    }

    requirementsState.placedCourses.set(baseId, { semester });

    // Get course info and update credits (pass useOldRules so old gen ed courses are found)
    const course = getCourseById(baseId, requirementsState.useOldRules);
    if (course) {
        requirementsState.totalCredits += course.credits;

        if (course.isUpperDivision) {
            requirementsState.udCredits += course.credits;
        }

        // Check for UD electives (biology major)
        if (course.isUpperDivision && !course.isRequired && !course.isKeystone) {
            if (!['BIO354', 'BIO355'].includes(baseId)) {
                requirementsState.udElectivesPlaced.push(baseId);
                if (course.hasLab) {
                    requirementsState.udElectivesWithLab++;
                }
                if (course.isNonHealth) {
                    requirementsState.nonHealthPlaced++;
                }
            }
        }

        // Track biopsychology electives
        if (BIOPSYCH_BIO_ELECTIVES.includes(baseId)) {
            requirementsState.biopsychBioElectives++;
        }
        if (BIOPSYCH_PSYCH_ELECTIVES.includes(baseId)) {
            requirementsState.biopsychPsychElectives++;
        }
        if (BIOPSYCH_KEYSTONES.includes(baseId)) {
            requirementsState.biopsychKeystone++;
        }
    }

    return true;
}

// Remove a placed course
function removePlacedCourse(courseId) {
    const baseId = courseId.replace(/L$/, '');

    if (!requirementsState.placedCourses.has(baseId)) {
        return false;
    }

    requirementsState.placedCourses.delete(baseId);

    // Get course info and update credits (pass useOldRules so old gen ed courses are found)
    const course = getCourseById(baseId, requirementsState.useOldRules);
    if (course) {
        requirementsState.totalCredits -= course.credits;

        if (course.isUpperDivision) {
            requirementsState.udCredits -= course.credits;
        }

        // Update UD elective tracking
        const idx = requirementsState.udElectivesPlaced.indexOf(baseId);
        if (idx > -1) {
            requirementsState.udElectivesPlaced.splice(idx, 1);
            if (course.hasLab) {
                requirementsState.udElectivesWithLab--;
            }
            if (course.isNonHealth) {
                requirementsState.nonHealthPlaced--;
            }
        }

        // Update biopsychology elective tracking
        if (BIOPSYCH_BIO_ELECTIVES.includes(baseId)) {
            requirementsState.biopsychBioElectives--;
        }
        if (BIOPSYCH_PSYCH_ELECTIVES.includes(baseId)) {
            requirementsState.biopsychPsychElectives--;
        }
        if (BIOPSYCH_KEYSTONES.includes(baseId)) {
            requirementsState.biopsychKeystone--;
        }
    }

    return true;
}

// Check if a specific course requirement is met
function isCourseCompleted(courseId) {
    return requirementsState.completedCourses.has(courseId) ||
           requirementsState.placedCourses.has(courseId);
}

// Check if any course from a list is completed
function isAnyCourseMet(courseList) {
    return courseList.some(c => isCourseCompleted(c));
}

// Check if all courses from a list are completed
function areAllCoursesMet(courseList) {
    return courseList.every(c => isCourseCompleted(c));
}

// Get current status of all requirements
function getRequirementsStatus() {
    const status = {
        // Credit checks
        totalCredits: {
            current: requirementsState.totalCredits,
            inProgress: requirementsState.totalCreditsInProgress,
            target: REQUIREMENTS.totalCredits.target,
            met: requirementsState.totalCredits >= REQUIREMENTS.totalCredits.target,
            willBeMet: (requirementsState.totalCredits + requirementsState.totalCreditsInProgress) >= REQUIREMENTS.totalCredits.target
        },
        udCredits: {
            current: requirementsState.udCredits,
            inProgress: requirementsState.udCreditsInProgress,
            target: REQUIREMENTS.udCredits.target,
            met: requirementsState.udCredits >= REQUIREMENTS.udCredits.target,
            willBeMet: (requirementsState.udCredits + requirementsState.udCreditsInProgress) >= REQUIREMENTS.udCredits.target
        },
        plpTotal: {
            current: requirementsState.plpTotal,
            target: REQUIREMENTS.plpTotal.target,
            met: requirementsState.plpTotal <= REQUIREMENTS.plpTotal.target
        },
        plpMajor: {
            current: requirementsState.plpMajor,
            target: REQUIREMENTS.plpMajor.target,
            met: requirementsState.plpMajor <= REQUIREMENTS.plpMajor.target
        },

        // Special requirements
        augsburgExperience: requirementsState.augsburgExperience,
        intentToGraduate: requirementsState.intentToGraduate,

        // Bio Major
        introSequence: {
            bio151: isCourseCompleted('BIO151'),
            bio152: isCourseCompleted('BIO152'),
            met: areAllCoursesMet(REQUIREMENTS.bioMajor.introSequence)
        },
        sophomoreLevel: {
            bio354: isCourseCompleted('BIO354'),
            bio355: isCourseCompleted('BIO355'),
            met: areAllCoursesMet(REQUIREMENTS.bioMajor.sophomoreLevel)
        },
        chemistry: {
            chm115: isCourseCompleted('CHM115'),
            chm116: isCourseCompleted('CHM116'),
            chm251: isCourseCompleted('CHM251'),
            met: areAllCoursesMet(REQUIREMENTS.bioMajor.chemistry)
        },
        precalc: {
            met: isCourseCompleted('MAT114') || requirementsState.hasMPG4
        },
        mathStats: {
            met: isAnyCourseMet(REQUIREMENTS.bioMajor.mathStats)
        },
        physics: {
            met: isAnyCourseMet(REQUIREMENTS.bioMajor.physics)
        },
        keystone: {
            met: isCourseCompleted('BIO490')
        },

        // UD Electives
        udElectives: {
            current: requirementsState.udElectivesPlaced.length,
            target: REQUIREMENTS.bioMajor.udElectives,
            met: requirementsState.udElectivesPlaced.length >= REQUIREMENTS.bioMajor.udElectives
        },
        udLabs: {
            current: requirementsState.udElectivesWithLab,
            target: REQUIREMENTS.bioMajor.udWithLab,
            met: requirementsState.udElectivesWithLab >= REQUIREMENTS.bioMajor.udWithLab
        },
        nonHealth: {
            current: requirementsState.nonHealthPlaced,
            target: REQUIREMENTS.bioMajor.nonHealth,
            met: requirementsState.nonHealthPlaced >= REQUIREMENTS.bioMajor.nonHealth
        },

        // Gen Ed
        genEd: { ...requirementsState.genEdCompleted }
    };

    return status;
}

// Update the UI with current requirements status
function updateRequirementsUI() {
    const status = getRequirementsStatus();

    // Update credit summary (with in-progress if available)
    updateCreditDisplay('total-credits', status.totalCredits.current, status.totalCredits.target, 'minimum', status.totalCredits.inProgress);
    updateCreditDisplay('ud-credits', status.udCredits.current, status.udCredits.target, 'minimum', status.udCredits.inProgress);
    updateCreditDisplay('plp-total', status.plpTotal.current, status.plpTotal.target, 'maximum');
    updateCreditDisplay('plp-major', status.plpMajor.current, status.plpMajor.target, 'maximum');

    // Update status icons for credit requirements (show pending if will be met with in-progress)
    updateStatusIcon('total-credits-status', status.totalCredits.met, status.totalCredits.willBeMet);
    updateStatusIcon('ud-credits-status', status.udCredits.met, status.udCredits.willBeMet);
    updateStatusIcon('plp-total-status', status.plpTotal.met);
    updateStatusIcon('plp-major-status', status.plpMajor.met);

    // Update special requirements
    updateStatusIcon('augsburg-exp-status', status.augsburgExperience);
    updateStatusIcon('intent-grad-status', status.intentToGraduate);

    // Update UD elective counters (Biology major)
    updateCounter('ud-elective-count', status.udElectives.current, status.udElectives.target);
    updateCounter('ud-lab-count', status.udLabs.current, status.udLabs.target);
    updateCounter('plant-ecology-count', status.nonHealth.current, status.nonHealth.target);

    // Update Biopsychology elective counters
    updateCounter('biopsych-bio-elective-count', requirementsState.biopsychBioElectives, 2);
    updateCounter('biopsych-psych-elective-count', requirementsState.biopsychPsychElectives, 2);
    updateCounter('biopsych-keystone-count', requirementsState.biopsychKeystone, 1);

    // Update Gen Ed status indicators based on which rules are in use
    if (requirementsState.useOldRules) {
        updateOldGenEdStatusIndicators();
    } else {
        updateGenEdStatusIndicators();
    }

    // Update course boxes in sidebar (gray out used ones)
    updateCourseBoxStates();

    // Update section status indicators
    updateSectionStatuses(status);
}

// Update Gen Ed status indicators
function updateGenEdStatusIndicators() {
    const genEdCategories = [
        'writing', 'math', 'sustWell', 'communication', 'localGlobal',
        'epsj', 'lab', 'art', 'religion', 'behavioral', 'humanities'
    ];

    genEdCategories.forEach(category => {
        const statusEl = document.getElementById(`gened-status-${category}`);
        // Scope selector to only the new gen ed section
        const itemEl = document.querySelector(`#gened-courses [data-gened-category="${category}"]`);
        // Complete if from audit OR placed by user
        const isComplete = requirementsState.genEdCompleted[category] || requirementsState.genEdPlaced[category];

        if (statusEl) {
            statusEl.classList.remove('check', 'x');
            if (isComplete) {
                statusEl.classList.add('check');
                statusEl.textContent = '\u2713';
            } else {
                statusEl.classList.add('x');
                statusEl.textContent = '\u2717';
            }
        }

        // Gray out the course box if complete
        if (itemEl) {
            const courseBox = itemEl.querySelector('.course-box');
            if (courseBox) {
                courseBox.classList.toggle('used', isComplete);
                courseBox.draggable = !isComplete;
            }
        }
    });
}

// Update OLD Gen Ed status indicators (pre-2025 rules)
function updateOldGenEdStatusIndicators() {
    // Map from category name to the course IDs that fulfill it
    const categoryToCourseIds = {
        effectiveWriting: ['OLD-GENED-EW'],
        modernLanguage: ['OLD-GENED-ML1', 'OLD-GENED-ML2'],
        wellness: ['OLD-GENED-WEL1', 'OLD-GENED-WEL2'],
        searchMeaning1: ['OLD-GENED-SM1'],
        searchMeaning2: ['OLD-GENED-SM2'],
        sciMathLAF: ['OLD-GENED-NSM1', 'OLD-GENED-NSM2'],
        socialBehavLAF: ['OLD-GENED-SB1', 'OLD-GENED-SB2'],
        fineArtsLAF: ['OLD-GENED-FA1', 'OLD-GENED-FA2'],
        humanitiesLAF: ['OLD-GENED-HUM1', 'OLD-GENED-HUM2']
    };

    Object.entries(categoryToCourseIds).forEach(([category, courseIds]) => {
        const statusObj = requirementsState.oldGenEdCompleted[category];
        const placedObj = requirementsState.oldGenEdPlaced[category];
        const isComplete = statusObj && statusObj.complete;
        // Combine completed and placed counts
        const completedCount = (statusObj && statusObj.have) || 0;
        const placedCount = (placedObj && placedObj.have) || 0;
        const haveCount = completedCount + placedCount;

        // Update status indicator for each course ID in this category
        // If complete, all show green. If partial, first 'haveCount' show green, rest show red
        courseIds.forEach((courseId, index) => {
            const statusEl = document.getElementById(`old-gened-status-${courseId}`);

            if (statusEl) {
                statusEl.classList.remove('check', 'x');
                // Show green check if complete, or if this slot is within the 'have' count
                if (isComplete || index < haveCount) {
                    statusEl.classList.add('check');
                    statusEl.textContent = '\u2713';
                } else {
                    statusEl.classList.add('x');
                    statusEl.textContent = '\u2717';
                }
            }
        });

        // Gray out course boxes based on completion
        const courseBoxes = document.querySelectorAll(`#old-gened-courses .gened-item[data-gened-category="${category}"] .course-box`);
        courseBoxes.forEach((courseBox, index) => {
            // Gray out if complete, or if this slot is within the 'have' count
            if (isComplete || index < haveCount) {
                courseBox.classList.add('used', 'placed-in-grid');
                courseBox.draggable = false;
            } else {
                courseBox.classList.remove('used', 'placed-in-grid');
                courseBox.draggable = true;
            }
        });
    });
}

// Mark a gen ed as placed by user
function setGenEdPlaced(category, isPlaced) {
    if (requirementsState.genEdPlaced.hasOwnProperty(category)) {
        requirementsState.genEdPlaced[category] = isPlaced;
    }
}

// Mark an old gen ed as placed/unplaced by user
function setOldGenEdPlaced(category, isPlaced) {
    if (requirementsState.oldGenEdPlaced.hasOwnProperty(category)) {
        if (isPlaced) {
            requirementsState.oldGenEdPlaced[category].have++;
        } else {
            requirementsState.oldGenEdPlaced[category].have = Math.max(0, requirementsState.oldGenEdPlaced[category].have - 1);
        }
    }
}

// Helper function to update credit display
function updateCreditDisplay(elementId, current, target, type, inProgress = 0) {
    const element = document.getElementById(elementId);
    if (element) {
        if (inProgress > 0) {
            element.textContent = `${current}+${inProgress}/${target}`;
        } else {
            element.textContent = `${current}/${target}`;
        }
    }
}

// Helper function to update status icon
// isMet: currently met, willBeMet: will be met with in-progress courses
function updateStatusIcon(elementId, isMet, willBeMet = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('check', 'x', 'pending');
        if (isMet) {
            element.classList.add('check');
            element.textContent = '\u2713'; // Checkmark
        } else if (willBeMet) {
            element.classList.add('pending');
            element.textContent = '\u2713'; // Checkmark (pending/yellow)
        } else {
            element.classList.add('x');
            element.textContent = '\u2717'; // X mark
        }
    }
}

// Helper function to update counter badges
function updateCounter(elementId, current, target) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = `${current}/${target} ${element.textContent.split(' ').slice(1).join(' ')}`;
        element.classList.toggle('complete', current >= target);
    }
}

// Update course box states in sidebar
function updateCourseBoxStates() {
    // Check if "choose one" requirements are met
    const mathStatsMet = isAnyCourseMet(REQUIREMENTS.bioMajor.mathStats);
    const physicsMet = isAnyCourseMet(REQUIREMENTS.bioMajor.physics);

    document.querySelectorAll('.requirements-panel .course-box').forEach(box => {
        const courseId = box.dataset.courseId;
        if (courseId && !courseId.startsWith('GENERIC')) {
            let isUsed = isCourseCompleted(courseId);
            // Special case: MAT114 (precalc) is satisfied by MPG4 placement
            if (courseId === 'MAT114' && requirementsState.hasMPG4) {
                isUsed = true;
            }
            // Special case: MATH placeholder satisfied if any math/stats course completed
            if (courseId === 'MATH' && mathStatsMet) {
                isUsed = true;
            }
            // Special case: PHYSICS placeholder satisfied if any physics course completed
            if (courseId === 'PHYSICS' && physicsMet) {
                isUsed = true;
            }
            box.classList.toggle('used', isUsed);
            box.draggable = !isUsed;
        }
    });
}

// Update section status indicators (check/X next to section titles)
function updateSectionStatuses(status) {
    // Biology Major sections
    updateSectionStatusIcon('intro-sequence-status', status.introSequence.met);
    updateSectionStatusIcon('sophomore-level-status', status.sophomoreLevel.met);
    updateSectionStatusIcon('chemistry-status', status.chemistry.met);

    // Supporting courses: precalc + mathStats + physics
    const supportingMet = status.precalc.met && status.mathStats.met && status.physics.met;
    updateSectionStatusIcon('supporting-status', supportingMet);

    // UD Electives: all three counters must be met
    const udElectivesMet = status.udElectives.met && status.udLabs.met && status.nonHealth.met;
    updateSectionStatusIcon('ud-electives-status', udElectivesMet);

    // Keystone: BIO490 OR any course placed in keystone section
    const keystoneMet = status.keystone.met || requirementsState.keystoneComplete;
    updateSectionStatusIcon('keystone-status', keystoneMet);

    // Biology Major overall: all sections complete
    const bioMajorMet = status.introSequence.met &&
                        status.sophomoreLevel.met &&
                        status.chemistry.met &&
                        supportingMet &&
                        udElectivesMet &&
                        keystoneMet;
    updateSectionStatusIcon('bio-major-status', bioMajorMet);

    // Biopsychology Major sections
    const biopsychRequiredCourses = ['BIO151', 'BIO152', 'BIO354', 'BIO475', 'CHM115', 'CHM116', 'PSY105', 'PSY215', 'PSY315', 'PSY355'];
    const biopsychRequiredMet = biopsychRequiredCourses.every(c => isCourseCompleted(c));
    updateSectionStatusIcon('biopsych-required-status', biopsychRequiredMet);

    const biopsychBioElectivesMet = requirementsState.biopsychBioElectives >= 2;
    updateSectionStatusIcon('biopsych-bio-electives-status', biopsychBioElectivesMet);

    const biopsychPsychElectivesMet = requirementsState.biopsychPsychElectives >= 2;
    updateSectionStatusIcon('biopsych-psych-electives-status', biopsychPsychElectivesMet);

    // Biopsychology Keystone: standard courses OR any keystone marked complete
    const biopsychKeystoneMet = requirementsState.biopsychKeystone >= 1 || requirementsState.keystoneComplete;
    updateSectionStatusIcon('biopsych-keystone-status', biopsychKeystoneMet);

    // Biopsychology Major overall
    const biopsychMajorMet = biopsychRequiredMet &&
                             biopsychBioElectivesMet &&
                             biopsychPsychElectivesMet &&
                             biopsychKeystoneMet;
    updateSectionStatusIcon('biopsych-major-status', biopsychMajorMet);

    // General Education status
    if (requirementsState.useOldRules) {
        const oldGenEdMet = isOldGenEdComplete();
        updateSectionStatusIcon('gened-old-status', oldGenEdMet);
    } else {
        const newGenEdMet = isNewGenEdComplete();
        updateSectionStatusIcon('gened-new-status', newGenEdMet);
    }
}

// Check if new Gen Ed requirements are complete (all categories)
function isNewGenEdComplete() {
    const categories = [
        'writing', 'math', 'sustWell', 'communication', 'localGlobal',
        'epsj', 'lab', 'art', 'religion', 'behavioral', 'humanities'
    ];
    return categories.every(cat =>
        requirementsState.genEdCompleted[cat] || requirementsState.genEdPlaced[cat]
    );
}

// Check if old Gen Ed requirements are complete
// Students can waive EITHER:
// a) Both Modern Language courses, OR
// b) Two LAF courses from different categories
function isOldGenEdComplete() {
    const state = requirementsState.oldGenEdCompleted;
    const placed = requirementsState.oldGenEdPlaced;

    // Helper to get total have count (completed + placed by user)
    const totalHave = (category) => {
        return ((state[category] && state[category].have) || 0) +
               ((placed[category] && placed[category].have) || 0);
    };

    // Helper to check if a requirement is complete or will be complete (in-progress counts)
    const isCompleteOrInProgress = (category) => {
        const req = state[category];
        if (!req) return false;
        const have = totalHave(category);
        // Complete if status is OK, OR if have >= required (including placed courses)
        return req.complete || (have >= (req.required || 1));
    };

    // Always required: effectiveWriting, wellness, searchMeaning1, searchMeaning2
    const coreComplete = isCompleteOrInProgress('effectiveWriting') &&
                         isCompleteOrInProgress('wellness') &&
                         isCompleteOrInProgress('searchMeaning1') &&
                         isCompleteOrInProgress('searchMeaning2');

    if (!coreComplete) {
        return false;
    }

    // LAF categories
    const lafCategories = ['sciMathLAF', 'socialBehavLAF', 'fineArtsLAF', 'humanitiesLAF'];
    const lafStatus = lafCategories.map(cat => {
        let complete = state[cat]?.complete;
        let have = totalHave(cat);
        const required = REQUIREMENTS.oldGenEd[cat]?.required || 2;

        // For biology/biopsychology majors, sciMathLAF is automatically fulfilled by major courses
        // If not explicitly marked complete but student is a science major, consider it complete
        if (cat === 'sciMathLAF' && !complete && typeof appState !== 'undefined') {
            if (appState.majorType === 'biology' || appState.majorType === 'biopsychology') {
                complete = true;
                have = 2;
            }
        }

        // Consider complete if status is OK OR have >= required (in-progress counts)
        const effectivelyComplete = complete || (have >= required);

        return {
            category: cat,
            complete: effectivelyComplete,
            have: have,
            required: required
        };
    });

    // Modern Language: complete if status is OK OR have >= 2
    const modernLangHave = totalHave('modernLanguage');
    const modernLangComplete = state.modernLanguage?.complete ||
                               (modernLangHave >= 2);

    // Option A: Waive Modern Language - all LAF must be complete
    if (!modernLangComplete) {
        const allLafComplete = lafStatus.every(laf => laf.complete);
        if (allLafComplete) {
            return true;
        }
    }

    // Option B: Take Modern Language - can waive up to 2 LAF courses from different categories
    if (modernLangComplete) {
        // Count how many LAF courses are missing, and from which categories
        let totalMissing = 0;
        let categoriesWithMissing = 0;

        lafStatus.forEach(laf => {
            const missing = laf.required - laf.have;
            if (missing > 0) {
                totalMissing += missing;
                categoriesWithMissing++;
            }
        });

        // Can waive up to 2 courses, but not both from the same category
        // So: max 2 missing total, and if 2 missing they must be from different categories
        if (totalMissing === 0) {
            return true;
        }
        if (totalMissing <= 2 && categoriesWithMissing >= totalMissing) {
            return true;
        }
    }

    return false;
}

// Helper to update a section status icon
function updateSectionStatusIcon(elementId, isMet) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('check', 'x');
        if (isMet) {
            element.classList.add('check');
            element.textContent = '\u2713'; // Checkmark
        } else {
            element.classList.add('x');
            element.textContent = '\u2717'; // X mark
        }
    }
}

// Set gen ed completion status (new rules)
function setGenEdComplete(category, isComplete) {
    if (requirementsState.genEdCompleted.hasOwnProperty(category)) {
        requirementsState.genEdCompleted[category] = isComplete;
    }
}

// Set old gen ed completion status (old rules)
function setOldGenEdComplete(category, statusObj) {
    if (requirementsState.oldGenEdCompleted.hasOwnProperty(category)) {
        requirementsState.oldGenEdCompleted[category] = statusObj;
    }
}

// Set which rules to use
function setUseOldRules(useOld) {
    requirementsState.useOldRules = useOld;
}

// Get whether using old rules
function getUseOldRules() {
    return requirementsState.useOldRules;
}

// Set special flags
function setAugsburgExperience(isComplete) {
    requirementsState.augsburgExperience = isComplete;
}

function setIntentToGraduate(isComplete) {
    requirementsState.intentToGraduate = isComplete;
}

function setMPG4(hasMPG4) {
    requirementsState.hasMPG4 = hasMPG4;
}

// Set total credits (from audit parsing)
function setTotalCredits(credits, inProgress = 0) {
    requirementsState.totalCredits = credits;
    requirementsState.totalCreditsInProgress = inProgress;
}

// Set upper division credits (from audit parsing)
function setUdCredits(credits, inProgress = 0) {
    requirementsState.udCredits = credits;
    requirementsState.udCreditsInProgress = inProgress;
}

// Set keystone completion (for non-standard approved keystones)
function setKeystoneComplete(isComplete) {
    requirementsState.keystoneComplete = isComplete;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        REQUIREMENTS,
        requirementsState,
        initRequirementsState,
        addCompletedCourse,
        addPlacedCourse,
        removePlacedCourse,
        isCourseCompleted,
        getRequirementsStatus,
        updateRequirementsUI,
        setGenEdComplete,
        setOldGenEdComplete,
        setOldGenEdPlaced,
        setUseOldRules,
        getUseOldRules,
        setAugsburgExperience,
        setIntentToGraduate,
        setMPG4,
        setTotalCredits,
        setUdCredits
    };
}
