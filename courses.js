// Course data for Biology Major Advising Scheduler
// Colors
const COLORS = {
    biology: '#4CAF50',      // Green
    chemistry: '#2196F3',    // Blue
    mathPhysics: '#f44336',  // Red
    psychology: '#8B0000',   // Dark red
    genEd: '#FFEB3B',        // Yellow
    minor: '#CE93D8',        // Light purple
    generic: '#FFFFFF',      // White
    completed: '#9E9E9E'     // Gray (for completed/locked courses)
};

// Biology Courses
const BIOLOGY_COURSES = [
    {
        id: 'BIO151',
        name: 'Introductory Biology I',
        nickname: 'Intro Bio I',
        credits: 5,
        hasLab: true,
        isUpperDivision: false,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['MAT105', 'MAT106', 'MPL3'], // OR relationship
        prereqType: 'or'
    },
    {
        id: 'BIO152',
        name: 'Introductory Biology II',
        nickname: 'Intro Bio II',
        credits: 5,
        hasLab: true,
        isUpperDivision: false,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['MAT105', 'MAT106', 'MPL3'],
        prereqType: 'or'
    },
    {
        id: 'BIO320',
        name: 'Human Anatomy',
        nickname: 'Anatomy',
        credits: 5,
        hasLab: true,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO354', 'BIO151', 'BIO152'],
        prereqType: 'and',
        isNonHealth: false
    },
    {
        id: 'BIO354',
        name: 'Cell Biology',
        nickname: 'Cell',
        credits: 5,
        hasLab: true,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO151', 'CHM116'],
        prereqType: 'and',
        isRequired: true
    },
    {
        id: 'BIO355',
        name: 'Genetics',
        nickname: 'Genetics',
        credits: 5,
        hasLab: true,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO151', 'BIO152', 'CHM116'],
        prereqType: 'and',
        isRequired: true
    },
    {
        id: 'BIO361',
        name: 'Plant Biology',
        nickname: 'Plant',
        credits: 5,
        hasLab: true,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO151', 'BIO152'],
        prereqType: 'and',
        isNonHealth: true  // Can fulfill non-health requirement
    },
    {
        id: 'BIO369',
        name: 'Biochemistry',
        nickname: 'Biochem',
        credits: 5,
        hasLab: true,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO354', 'CHM251'],
        prereqType: 'and',
        isNonHealth: false
    },
    {
        id: 'BIO370',
        name: 'Biochemistry II',
        nickname: 'Biochem II',
        credits: 4,
        hasLab: false,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO369'],
        prereqType: 'and',
        isNonHealth: false
    },
    {
        id: 'BIO420',
        name: 'Conservation Biology',
        nickname: 'Conservation',
        credits: 4,
        hasLab: false,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO355', 'BIO152'],
        prereqType: 'and',
        isNonHealth: true  // Can fulfill non-health requirement
    },
    {
        id: 'BIO444',
        name: 'Genomics and Biotechnology',
        nickname: 'Genomics',
        credits: 5,
        hasLab: true,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO355'],
        prereqType: 'and',
        isNonHealth: true  // Can fulfill non-health requirement
    },
    {
        id: 'BIO473',
        name: 'Physiology of Humans and Other Animals',
        nickname: 'Physiology',
        credits: 5,
        hasLab: true,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO354'],
        prereqType: 'and',
        isNonHealth: false
    },
    {
        id: 'BIO474',
        name: 'Developmental Biology',
        nickname: 'Developmental',
        credits: 5,
        hasLab: true,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO354', 'BIO355'],
        prereqType: 'and',
        isNonHealth: false
    },
    {
        id: 'BIO475',
        name: 'Neurobiology',
        nickname: 'Neuro',
        credits: 5,
        hasLab: true,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO354'],
        prereqType: 'and',
        isNonHealth: false
    },
    {
        id: 'BIO476',
        name: 'Microbiology',
        nickname: 'Micro',
        credits: 5,
        hasLab: true,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO354', 'BIO355'],
        prereqType: 'and',
        isNonHealth: false
    },
    {
        id: 'BIO481',
        name: 'Ecology',
        nickname: 'Ecology',
        credits: 5,
        hasLab: true,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO151', 'BIO152', 'CHM116'],
        prereqType: 'and',
        isNonHealth: true  // Can fulfill non-health requirement
    },
    {
        id: 'BIO485',
        name: 'Advanced Topics in Biology',
        nickname: 'Topics',
        credits: 2,
        hasLab: false,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO354', 'BIO355', 'BIO151', 'BIO152'],
        prereqType: 'and',
        isNonHealth: false,
        canTakeTwice: true
    },
    {
        id: 'BIO485-2',
        name: 'Advanced Topics in Biology (2nd)',
        nickname: 'Topics 2',
        credits: 2,
        hasLab: false,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO354', 'BIO355', 'BIO151', 'BIO152'],
        prereqType: 'and',
        isNonHealth: false,
        isSecondInstance: true
    },
    {
        id: 'BIO486',
        name: 'Immunology',
        nickname: 'Immunology',
        credits: 4,
        hasLab: false,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO354', 'BIO355'],
        prereqType: 'and',
        isNonHealth: false
    },
    {
        id: 'BIO490',
        name: 'Biology Keystone',
        nickname: 'Keystone',
        credits: 2,
        hasLab: false,
        isUpperDivision: true,
        category: 'biology',
        color: COLORS.biology,
        prerequisites: ['BIO354', 'BIO355'],
        prereqType: 'and',
        isKeystone: true
    }
];

// Chemistry Courses
const CHEMISTRY_COURSES = [
    {
        id: 'CHM115',
        name: 'General Chemistry I',
        nickname: 'Gen Chem I',
        credits: 5,
        hasLab: true,
        isUpperDivision: false,
        category: 'chemistry',
        color: COLORS.chemistry,
        prerequisites: ['MAT105', 'MAT106', 'MPL3'],
        prereqType: 'or'
    },
    {
        id: 'CHM116',
        name: 'General Chemistry II',
        nickname: 'Gen Chem II',
        credits: 5,
        hasLab: true,
        isUpperDivision: false,
        category: 'chemistry',
        color: COLORS.chemistry,
        prerequisites: ['CHM115'],
        prereqType: 'and'
    },
    {
        id: 'CHM251',
        name: 'Organic Chemistry I',
        nickname: 'Organic',
        credits: 5,
        hasLab: true,
        isUpperDivision: false,
        category: 'chemistry',
        color: COLORS.chemistry,
        prerequisites: ['CHM116'],
        prereqType: 'and'
    }
];

// Math and Physics Courses (supporting courses)
const MATH_PHYSICS_COURSES = [
    {
        id: 'MAT114',
        name: 'Precalculus',
        nickname: 'Precalc',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'mathPhysics',
        color: COLORS.mathPhysics,
        prerequisites: [],
        prereqType: 'none',
        fulfills: 'precalc'
    },
    {
        id: 'MATH',
        name: 'Math Requirement',
        nickname: 'Math',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'mathPhysics',
        color: COLORS.mathPhysics,
        prerequisites: [],
        prereqType: 'none',
        fulfills: 'mathStats',
        isPlaceholder: true,
        validCourses: ['MAT145', 'MAT163', 'DST164', 'PSY215']
    },
    {
        id: 'PHYSICS',
        name: 'Physics Requirement',
        nickname: 'Physics',
        credits: 5,
        hasLab: true,
        isUpperDivision: false,
        category: 'mathPhysics',
        color: COLORS.mathPhysics,
        prerequisites: [],
        prereqType: 'none',
        fulfills: 'physics',
        isPlaceholder: true,
        validCourses: ['PHY107', 'PHY116', 'PHY121']
    },
    {
        id: 'PHY317',
        name: 'Biophysics',
        nickname: 'Biophysics',
        credits: 5,
        hasLab: true,
        isUpperDivision: true,
        category: 'mathPhysics',
        color: COLORS.mathPhysics,
        prerequisites: ['PHY121', 'MAT163'],
        prereqType: 'and',
        isBiopsychBioElective: true
    }
];

// Psychology Courses (for Biopsychology major)
const PSYCHOLOGY_COURSES = [
    // Required courses
    {
        id: 'PSY105',
        name: 'Principles of Psychology',
        nickname: 'Intro Psych',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'psychology',
        color: COLORS.psychology,
        prerequisites: [],
        prereqType: 'none'
    },
    {
        id: 'PSY215',
        name: 'Research Methods and Statistics I',
        nickname: 'Methods I',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'psychology',
        color: COLORS.psychology,
        prerequisites: ['PSY105'],
        prereqType: 'and'
    },
    {
        id: 'PSY315',
        name: 'Research Methods and Statistics II',
        nickname: 'Methods II',
        credits: 4,
        hasLab: false,
        isUpperDivision: true,
        category: 'psychology',
        color: COLORS.psychology,
        prerequisites: ['PSY215'],
        prereqType: 'and'
    },
    {
        id: 'PSY355',
        name: 'Biopsychology',
        nickname: 'Biopsych',
        credits: 4,
        hasLab: false,
        isUpperDivision: true,
        category: 'psychology',
        color: COLORS.psychology,
        prerequisites: ['PSY215'],
        prereqType: 'and'
    },
    // Psych electives
    {
        id: 'PSY253',
        name: 'Aging and Adulthood',
        nickname: 'Aging',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'psychology',
        color: COLORS.psychology,
        prerequisites: ['PSY105'],
        prereqType: 'and',
        isPsychElective: true
    },
    {
        id: 'PSY262',
        name: 'Psychopathology',
        nickname: 'Psychopath',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'psychology',
        color: COLORS.psychology,
        prerequisites: ['PSY105'],
        prereqType: 'and',
        isPsychElective: true
    },
    {
        id: 'PSY299',
        name: 'Directed Study',
        nickname: 'Dir. Study',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'psychology',
        color: COLORS.psychology,
        prerequisites: ['PSY105'],
        prereqType: 'and',
        isPsychElective: true
    },
    {
        id: 'PSY325',
        name: 'Social Behavior',
        nickname: 'Social',
        credits: 4,
        hasLab: false,
        isUpperDivision: true,
        category: 'psychology',
        color: COLORS.psychology,
        prerequisites: ['PSY215'],
        prereqType: 'and',
        isPsychElective: true
    },
    {
        id: 'PSY354',
        name: 'Cognitive Psychology',
        nickname: 'Cognitive',
        credits: 4,
        hasLab: false,
        isUpperDivision: true,
        category: 'psychology',
        color: COLORS.psychology,
        prerequisites: ['PSY215'],
        prereqType: 'and',
        isPsychElective: true
    },
    {
        id: 'PSY391',
        name: 'Individual Differences',
        nickname: 'Ind. Diff.',
        credits: 4,
        hasLab: false,
        isUpperDivision: true,
        category: 'psychology',
        color: COLORS.psychology,
        prerequisites: ['PSY215'],
        prereqType: 'and',
        isPsychElective: true
    },
    {
        id: 'PSY410',
        name: 'Clinical Neuropsychology',
        nickname: 'Neuropsych',
        credits: 4,
        hasLab: false,
        isUpperDivision: true,
        category: 'psychology',
        color: COLORS.psychology,
        prerequisites: ['PSY315'],
        prereqType: 'and',
        isPsychElective: true
    },
    {
        id: 'PSY491',
        name: 'Advanced Research Seminar',
        nickname: 'Adv. Research',
        credits: 4,
        hasLab: false,
        isUpperDivision: true,
        category: 'psychology',
        color: COLORS.psychology,
        prerequisites: ['PSY315'],
        prereqType: 'and',
        isPsychElective: true
    },
    // Keystone
    {
        id: 'PSY400',
        name: 'Keystone Internship',
        nickname: 'Psych Keystone',
        credits: 4,
        hasLab: false,
        isUpperDivision: true,
        category: 'psychology',
        color: COLORS.psychology,
        prerequisites: ['PSY315'],
        prereqType: 'and',
        isKeystone: true
    }
];

// General Education placeholder courses
const GENED_COURSES = [
    {
        id: 'GENED-ART',
        name: 'Arts Requirement',
        nickname: 'Art',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'art'
    },
    {
        id: 'GENED-HUM',
        name: 'Humanities Requirement',
        nickname: 'Humanities',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'humanities'
    },
    {
        id: 'GENED-COMM',
        name: 'Communication Requirement',
        nickname: 'Communication',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'communication'
    },
    {
        id: 'GENED-MATH',
        name: 'Math Gen Ed Requirement',
        nickname: 'Math',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'math'
    },
    {
        id: 'GENED-LAB',
        name: 'Lab Science Requirement',
        nickname: 'Lab',
        credits: 5,
        hasLab: true,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'lab'
    },
    {
        id: 'GENED-BEH',
        name: 'Behavioral Sciences Requirement',
        nickname: 'Behavioral',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'behavioral'
    },
    {
        id: 'GENED-WRT',
        name: 'Writing Requirement',
        nickname: 'Writing',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'writing'
    },
    {
        id: 'GENED-EPSJ',
        name: 'Equity, Power and Social Justice',
        nickname: 'EPSJ',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'epsj'
    },
    {
        id: 'GENED-LG',
        name: 'Local/Global Perspectives',
        nickname: 'Local/Global',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'localGlobal'
    },
    {
        id: 'GENED-SW',
        name: 'Sustainability and Wellness',
        nickname: 'Sust/Well',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'sustWell'
    },
    {
        id: 'GENED-REL',
        name: 'RLN/Search for Meaning',
        nickname: 'Religion',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'religion'
    }
];

// OLD General Education placeholder courses (pre-2025 catalog years)
const OLD_GENED_COURSES = [
    {
        id: 'OLD-GENED-EW',
        name: 'Effective Writing II',
        nickname: 'Eff Writing',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'effectiveWriting'
    },
    {
        id: 'OLD-GENED-ML1',
        name: 'Modern Language I',
        nickname: 'Mod Lang I',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'modernLanguage'
    },
    {
        id: 'OLD-GENED-ML2',
        name: 'Modern Language II',
        nickname: 'Mod Lang II',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'modernLanguage'
    },
    {
        id: 'OLD-GENED-WEL1',
        name: 'Wellness I',
        nickname: 'Wellness I',
        credits: 1,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'wellness'
    },
    {
        id: 'OLD-GENED-WEL2',
        name: 'Wellness II',
        nickname: 'Wellness II',
        credits: 1,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'wellness'
    },
    {
        id: 'OLD-GENED-SM1',
        name: 'Search for Meaning I',
        nickname: 'Search I',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'searchMeaning1'
    },
    {
        id: 'OLD-GENED-SM2',
        name: 'Search for Meaning II',
        nickname: 'Search II',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'searchMeaning2'
    },
    {
        id: 'OLD-GENED-NSM1',
        name: 'Natural Sci/Math LAF I',
        nickname: 'Sci/Math I',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'sciMathLAF'
    },
    {
        id: 'OLD-GENED-NSM2',
        name: 'Natural Sci/Math LAF II',
        nickname: 'Sci/Math II',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'sciMathLAF'
    },
    {
        id: 'OLD-GENED-SB1',
        name: 'Social/Behavioral LAF I',
        nickname: 'Soc/Beh I',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'socialBehavLAF'
    },
    {
        id: 'OLD-GENED-SB2',
        name: 'Social/Behavioral LAF II',
        nickname: 'Soc/Beh II',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'socialBehavLAF'
    },
    {
        id: 'OLD-GENED-FA1',
        name: 'Fine Arts LAF I',
        nickname: 'Fine Arts I',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'fineArtsLAF'
    },
    {
        id: 'OLD-GENED-FA2',
        name: 'Fine Arts LAF II',
        nickname: 'Fine Arts II',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'fineArtsLAF'
    },
    {
        id: 'OLD-GENED-HUM1',
        name: 'Humanities LAF I',
        nickname: 'Humanities I',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'humanitiesLAF'
    },
    {
        id: 'OLD-GENED-HUM2',
        name: 'Humanities LAF II',
        nickname: 'Humanities II',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'genEd',
        color: COLORS.genEd,
        prerequisites: [],
        fulfills: 'humanitiesLAF'
    }
];

// Minor course placeholders (replenishing)
const MINOR_COURSES = [
    {
        id: 'MINOR-4',
        name: 'Minor 4-Credit Course',
        nickname: 'Minor (4)',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'minor',
        color: COLORS.minor,
        prerequisites: [],
        isMinor: true,
        replenishes: true
    },
    {
        id: 'MINOR-3',
        name: 'Minor 3-Credit Course',
        nickname: 'Minor (3)',
        credits: 3,
        hasLab: false,
        isUpperDivision: false,
        category: 'minor',
        color: COLORS.minor,
        prerequisites: [],
        isMinor: true,
        replenishes: true
    },
    {
        id: 'MINOR-2',
        name: 'Minor 2-Credit Course',
        nickname: 'Minor (2)',
        credits: 2,
        hasLab: false,
        isUpperDivision: false,
        category: 'minor',
        color: COLORS.minor,
        prerequisites: [],
        isMinor: true,
        replenishes: true
    }
];

// Generic placeholder courses (replenishing)
const GENERIC_COURSES = [
    {
        id: 'GENERIC-4',
        name: 'Generic 4-Credit Course',
        nickname: '4 Credits',
        credits: 4,
        hasLab: false,
        isUpperDivision: false,
        category: 'generic',
        color: COLORS.generic,
        prerequisites: [],
        isGeneric: true,
        replenishes: true
    },
    {
        id: 'GENERIC-2',
        name: 'Generic 2-Credit Course',
        nickname: '2 Credits',
        credits: 2,
        hasLab: false,
        isUpperDivision: false,
        category: 'generic',
        color: COLORS.generic,
        prerequisites: [],
        isGeneric: true,
        replenishes: true
    },
    {
        id: 'GENERIC-1',
        name: 'Generic 1-Credit Course',
        nickname: '1 Credit',
        credits: 1,
        hasLab: false,
        isUpperDivision: false,
        category: 'generic',
        color: COLORS.generic,
        prerequisites: [],
        isGeneric: true,
        replenishes: true
    }
];

// All courses combined (new rules)
const ALL_COURSES = [
    ...BIOLOGY_COURSES,
    ...CHEMISTRY_COURSES,
    ...MATH_PHYSICS_COURSES,
    ...PSYCHOLOGY_COURSES,
    ...GENED_COURSES,
    ...MINOR_COURSES,
    ...GENERIC_COURSES
];

// All courses for old rules
const ALL_COURSES_OLD = [
    ...BIOLOGY_COURSES,
    ...CHEMISTRY_COURSES,
    ...MATH_PHYSICS_COURSES,
    ...PSYCHOLOGY_COURSES,
    ...OLD_GENED_COURSES,
    ...MINOR_COURSES,
    ...GENERIC_COURSES
];

// Helper function to get course by ID
function getCourseById(id, useOldRules = false) {
    // Handle lab courses - return the main course
    const baseId = id.replace(/L$/, '');
    const courses = useOldRules ? ALL_COURSES_OLD : ALL_COURSES;
    return courses.find(c => c.id === baseId || c.id === id);
}

// Helper function to get all UD Biology electives
function getUDElectives() {
    return BIOLOGY_COURSES.filter(c =>
        c.isUpperDivision &&
        !c.isRequired &&
        !c.isKeystone &&
        c.id !== 'BIO354' &&
        c.id !== 'BIO355'
    );
}

// Helper function to get non-health UD courses
function getNonHealthCourses() {
    return BIOLOGY_COURSES.filter(c => c.isNonHealth === true);
}

// Helper function to get courses with labs (for UD lab requirement)
function getUDCoursesWithLab() {
    return BIOLOGY_COURSES.filter(c => c.isUpperDivision && c.hasLab);
}

// Helper function to get psychology electives
function getPsychElectives() {
    return PSYCHOLOGY_COURSES.filter(c => c.isPsychElective === true);
}

// Helper function to get biology electives for biopsych major
function getBiopsychBioElectives() {
    return [
        BIOLOGY_COURSES.find(c => c.id === 'BIO355'),  // Genetics
        BIOLOGY_COURSES.find(c => c.id === 'BIO369'),  // Biochemistry
        BIOLOGY_COURSES.find(c => c.id === 'BIO473'),  // Physiology
        BIOLOGY_COURSES.find(c => c.id === 'BIO474'),  // Developmental
        MATH_PHYSICS_COURSES.find(c => c.id === 'PHY317') // Biophysics (if exists)
    ].filter(c => c); // Filter out undefined
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        COLORS,
        BIOLOGY_COURSES,
        CHEMISTRY_COURSES,
        MATH_PHYSICS_COURSES,
        PSYCHOLOGY_COURSES,
        GENED_COURSES,
        OLD_GENED_COURSES,
        MINOR_COURSES,
        GENERIC_COURSES,
        ALL_COURSES,
        ALL_COURSES_OLD,
        getCourseById,
        getUDElectives,
        getNonHealthCourses,
        getUDCoursesWithLab,
        getPsychElectives,
        getBiopsychBioElectives
    };
}
