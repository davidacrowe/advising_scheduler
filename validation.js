// Course Validation - Prerequisites and Semester Offerings
// Parsed from bio courses.txt

// Course offering patterns
// fall: true/false, spring: true/false, yearParity: 'odd'/'even'/null
const COURSE_OFFERINGS = {
    // Biology courses
    'BIO151': { fall: true, spring: true, yearParity: null },
    'BIO152': { fall: true, spring: true, yearParity: null },
    'BIO320': { fall: false, spring: true, yearParity: null },
    'BIO354': { fall: true, spring: true, yearParity: null },
    'BIO355': { fall: true, spring: true, yearParity: null },
    'BIO361': { fall: false, spring: true, yearParity: 'odd' },
    'BIO369': { fall: true, spring: true, yearParity: null },
    'BIO370': { fall: false, spring: true, yearParity: null },
    'BIO420': { fall: false, spring: true, yearParity: null },
    'BIO444': { fall: false, spring: true, yearParity: 'even' },
    'BIO473': { fall: true, spring: false, yearParity: null },
    'BIO474': { fall: false, spring: true, yearParity: 'even' },
    'BIO475': { fall: false, spring: true, yearParity: null },
    'BIO476': { fall: true, spring: false, yearParity: null },
    'BIO481': { fall: false, spring: true, yearParity: null },
    'BIO485': { fall: true, spring: true, yearParity: null },
    'BIO486': { fall: false, spring: true, yearParity: null },
    'BIO490': { fall: true, spring: true, yearParity: null },
    // Chemistry courses
    'CHM115': { fall: true, spring: true, yearParity: null },
    'CHM116': { fall: true, spring: true, yearParity: null },
    'CHM251': { fall: true, spring: false, yearParity: null },
    // Psychology courses
    'PSY105': { fall: true, spring: true, yearParity: null },
    'PSY215': { fall: true, spring: true, yearParity: null },
    'PSY253': { fall: false, spring: true, yearParity: null },
    'PSY262': { fall: true, spring: true, yearParity: null },
    'PSY315': { fall: true, spring: true, yearParity: null },
    'PSY325': { fall: true, spring: true, yearParity: null },
    'PSY354': { fall: true, spring: true, yearParity: null },
    'PSY355': { fall: true, spring: false, yearParity: null },
    'PSY391': { fall: false, spring: true, yearParity: 'even' },
    'PSY396': { fall: true, spring: true, yearParity: null },
    'PSY400': { fall: true, spring: true, yearParity: null },
    'PSY410': { fall: false, spring: true, yearParity: 'odd' },
    'PSY491': { fall: true, spring: true, yearParity: null }
};

// Course prerequisites
// type: 'required' = ALL courses needed, 'oneOf' = at least ONE course needed
const COURSE_PREREQUISITES = {
    'BIO151': [
        { type: 'oneOf', courses: ['MAT105', 'MAT106', 'MPL3'] }
    ],
    'BIO152': [
        { type: 'oneOf', courses: ['MAT105', 'MAT106', 'MPL3'] }
    ],
    'BIO320': [
        { type: 'oneOf', courses: ['BIO253', 'BIO354'] },
        { type: 'required', courses: ['BIO151', 'BIO152'] }
    ],
    'BIO354': [
        { type: 'required', courses: ['BIO151', 'CHM116'] }
    ],
    'BIO355': [
        { type: 'required', courses: ['BIO151', 'BIO152', 'CHM116'] }
    ],
    'BIO361': [
        { type: 'required', courses: ['BIO151', 'BIO152'] }
    ],
    'BIO369': [
        { type: 'oneOf', courses: ['DST164', 'MAT114', 'MAT145', 'MAT163', 'PSY215'] },
        { type: 'required', courses: ['BIO354', 'CHM251'] }
    ],
    'BIO370': [
        { type: 'oneOf', courses: ['BIO369', 'CHM369'] }
    ],
    'BIO420': [
        { type: 'oneOf', courses: ['BIO255', 'BIO355', 'ENV320'] },
        { type: 'required', courses: ['BIO152'] }
    ],
    'BIO444': [
        { type: 'required', courses: ['BIO355'] }
    ],
    'BIO473': [
        { type: 'oneOf', courses: ['DST164', 'MAT114', 'MAT145', 'MAT163', 'PSY215'] },
        { type: 'required', courses: ['BIO354'] }
    ],
    'BIO474': [
        { type: 'required', courses: ['BIO354', 'BIO355'] }
    ],
    'BIO475': [
        { type: 'required', courses: ['BIO354'] }
    ],
    'BIO476': [
        { type: 'required', courses: ['BIO354', 'BIO355'] }
    ],
    'BIO481': [
        { type: 'oneOf', courses: ['DST164', 'MAT114', 'MAT145', 'MAT163', 'MAT164', 'PSY215'] },
        { type: 'required', courses: ['BIO151', 'BIO152', 'CHM116'] }
    ],
    'BIO485': [
        { type: 'oneOf', courses: ['BIO253', 'BIO354'] },
        { type: 'oneOf', courses: ['BIO255', 'BIO355'] },
        { type: 'required', courses: ['BIO151', 'BIO152'] }
    ],
    'BIO486': [
        { type: 'required', courses: ['BIO354', 'BIO355'] }
    ],
    'BIO490': [
        { type: 'oneOf', courses: ['BIO253', 'BIO354'] },
        { type: 'oneOf', courses: ['BIO255', 'BIO355', 'BIO369', 'CHM369'] }
    ],
    'CHM115': [
        { type: 'oneOf', courses: ['MAT105', 'MAT106', 'MPL3'] }
    ],
    'CHM116': [
        { type: 'required', courses: ['CHM115'] }
    ],
    'CHM251': [
        { type: 'required', courses: ['CHM116'] }
    ],
    // Psychology courses
    'PSY215': [
        { type: 'oneOf', courses: ['MAT105', 'MAT106', 'MPL3'] },
        { type: 'required', courses: ['PSY105'] }
    ],
    'PSY253': [
        { type: 'required', courses: ['PSY105'] }
    ],
    'PSY262': [
        { type: 'required', courses: ['PSY105'] }
    ],
    'PSY315': [
        { type: 'oneOf', courses: ['ENL111', 'ENL112', 'HON111', 'WPL'] },
        { type: 'required', courses: ['PSY215'] }
    ],
    'PSY325': [
        { type: 'required', courses: ['PSY215'] }
    ],
    'PSY354': [
        { type: 'required', courses: ['PSY215'] }
    ],
    'PSY355': [
        { type: 'required', courses: ['PSY215'] }
    ],
    'PSY391': [
        { type: 'required', courses: ['PSY215'] }
    ],
    'PSY396': [
        { type: 'oneOf', courses: ['ENL111', 'ENL112', 'HON111', 'WPL'] },
        { type: 'required', courses: ['PSY315'] }
    ],
    'PSY400': [
        { type: 'required', courses: ['PSY315'] }
    ],
    'PSY410': [
        { type: 'required', courses: ['PSY315'] }
    ],
    'PSY491': [
        { type: 'oneOf', courses: ['ENL111', 'ENL112', 'HON111', 'WPL'] },
        { type: 'required', courses: ['PSY315'] }
    ]
};

// Convert semester ID to sortable value for comparison
// 'fall-1' -> 10, 'spring-1' -> 11, 'summer-1' -> 12
// 'fall-2' -> 20, etc.
function semesterIdToSortValue(semesterId) {
    const match = semesterId.match(/(fall|spring|summer)-(\d+)/);
    if (!match) return 0;
    const yearNum = parseInt(match[2]);
    const seasonOffset = { fall: 0, spring: 1, summer: 2 }[match[1]];
    return yearNum * 10 + seasonOffset;
}

// Get all courses available before a given semester
// Includes completed courses and courses placed in earlier semesters
function getCoursesAvailableByTime(targetSemesterId) {
    const availableCourses = new Set();
    const targetValue = semesterIdToSortValue(targetSemesterId);

    // Add all completed courses (from audit)
    if (typeof requirementsState !== 'undefined' && requirementsState.completedCourses) {
        requirementsState.completedCourses.forEach((data, courseId) => {
            availableCourses.add(courseId);
        });
    }

    // Add courses placed in earlier semesters (including summer of SAME year)
    if (typeof requirementsState !== 'undefined' && requirementsState.placedCourses) {
        requirementsState.placedCourses.forEach((data, courseId) => {
            if (data.semester) {
                const placedValue = semesterIdToSortValue(data.semester);
                // A course in an earlier semester counts as a prereq
                if (placedValue < targetValue) {
                    availableCourses.add(courseId);
                }
            }
        });
    }

    return availableCourses;
}

// Check if prerequisites are met for a course placement
function arePrerequisitesMet(courseId, targetSemesterId) {
    const prereqs = COURSE_PREREQUISITES[courseId];
    if (!prereqs || prereqs.length === 0) {
        return { met: true, message: null };
    }

    const availableCourses = getCoursesAvailableByTime(targetSemesterId);
    const missingGroups = [];

    for (const prereqGroup of prereqs) {
        if (prereqGroup.type === 'required') {
            // ALL courses must be available
            const missing = prereqGroup.courses.filter(c => !availableCourses.has(c));
            if (missing.length > 0) {
                missingGroups.push({
                    type: 'required',
                    missing: missing,
                    all: prereqGroup.courses
                });
            }
        } else if (prereqGroup.type === 'oneOf') {
            // At least ONE course must be available
            const hasOne = prereqGroup.courses.some(c => availableCourses.has(c));
            if (!hasOne) {
                missingGroups.push({
                    type: 'oneOf',
                    options: prereqGroup.courses
                });
            }
        }
    }

    if (missingGroups.length === 0) {
        return { met: true, message: null };
    }

    // Build error message
    const messages = missingGroups.map(group => {
        if (group.type === 'required') {
            return `requires ${group.missing.join(' and ')}`;
        } else {
            return `requires one of: ${group.options.join(', ')}`;
        }
    });

    return {
        met: false,
        message: `${courseId} ${messages.join('; ')}`
    };
}

// Check if a course is offered in a given semester
function isCourseOfferedInSemester(courseId, semesterId) {
    const offering = COURSE_OFFERINGS[courseId];
    if (!offering) {
        // Course not in our offerings database - allow it
        return { offered: true, message: null };
    }

    // Get the actual term from semester mapping
    if (typeof appState === 'undefined' || !appState.semesterMapping) {
        return { offered: true, message: null };
    }

    const term = appState.semesterMapping[semesterId];
    if (!term) {
        return { offered: true, message: null };
    }

    // Parse the term (e.g., "FA25" -> Fall 2025, "SP26" -> Spring 2026)
    const termMatch = term.match(/^(FA|SP|SU)(\d{2})$/);
    if (!termMatch) {
        return { offered: true, message: null };
    }

    const [, season, yearStr] = termMatch;
    const year = 2000 + parseInt(yearStr);
    const isFall = season === 'FA';
    const isSpring = season === 'SP';
    const isSummer = season === 'SU';

    // Summer - bypass validation (per user request)
    if (isSummer) {
        return { offered: true, message: null };
    }

    // Check if offered in this season
    if (isFall && !offering.fall) {
        let msg = `${courseId} is only offered in Spring`;
        if (offering.yearParity) {
            msg += ` of ${offering.yearParity} years`;
        }
        return { offered: false, message: msg };
    }

    if (isSpring && !offering.spring) {
        let msg = `${courseId} is only offered in Fall`;
        if (offering.yearParity) {
            msg += ` of ${offering.yearParity} years`;
        }
        return { offered: false, message: msg };
    }

    // Check year parity if applicable
    if (offering.yearParity) {
        const isOddYear = year % 2 === 1;
        const isEvenYear = !isOddYear;

        if (offering.yearParity === 'odd' && !isOddYear) {
            return {
                offered: false,
                message: `${courseId} is only offered in Spring of odd years (${year - 1}, ${year + 1}...)`
            };
        }

        if (offering.yearParity === 'even' && !isEvenYear) {
            return {
                offered: false,
                message: `${courseId} is only offered in Spring of even years (${year - 1}, ${year + 1}...)`
            };
        }
    }

    return { offered: true, message: null };
}

// Main validation function - returns { valid: boolean, message: string|null }
function validateCoursePlacement(courseId, semesterId) {
    // Check semester offerings first
    const offeringCheck = isCourseOfferedInSemester(courseId, semesterId);
    if (!offeringCheck.offered) {
        return { valid: false, message: offeringCheck.message };
    }

    // Check prerequisites
    const prereqCheck = arePrerequisitesMet(courseId, semesterId);
    if (!prereqCheck.met) {
        return { valid: false, message: prereqCheck.message };
    }

    return { valid: true, message: null };
}

// Show validation error in header
function showValidationError(message) {
    const errorEl = document.getElementById('validation-error');
    const messageEl = document.getElementById('validation-error-message');
    if (errorEl && messageEl) {
        messageEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
}

// Hide validation error in header
function hideValidationError() {
    const errorEl = document.getElementById('validation-error');
    if (errorEl) {
        errorEl.classList.add('hidden');
    }
}
