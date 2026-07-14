export const HOA_RULES = [
  {
    id: 1,
    title: 'User Regulations',
    status: 'Active',
    tags: ['Team Crew', 'Learners', 'Visitors', 'Authors'],
    description: 'Platform-wide conduct, account security, and acceptable use for everyone on Academia.',
    sections: [
      {
        heading: 'Account responsibility',
        body: 'Users must keep login credentials secure and are responsible for activity under their account. Sharing accounts or attempting to bypass access controls may result in suspension.',
      },
      {
        heading: 'Acceptable use',
        body: 'Content must be lawful, respectful, and relevant to learning. Harassment, spam, plagiarism, and attempts to disrupt the service are prohibited.',
      },
      {
        heading: 'Enforcement',
        body: 'HOA administrators may warn, restrict, or suspend accounts that violate these rules. Appeals can be sent to support@gonaraza.com.',
      },
    ],
  },
  {
    id: 2,
    title: "Learner's Rules",
    status: 'Active',
    tags: ['Learners', 'Certificates', 'Assessments'],
    description: 'Enrollment expectations, assessment integrity, and certificate eligibility for students.',
    sections: [
      {
        heading: '1. Getting started',
        body: 'Learners should complete profile verification before enrolling in paid courses. Use the sign-in flow and check your email for verification codes if prompted.',
      },
      {
        heading: '2. Course progress and assessments',
        body: 'Complete chapters in order when required, attempt assessments honestly, and respect time limits. Retakes follow the policy shown on each assessment.',
      },
      {
        heading: '3. Certificates',
        body: 'Certificates are issued only after course completion and passing scores. Claims may require HOA approval before download is enabled.',
      },
    ],
  },
  {
    id: 3,
    title: "Tutor's Rules",
    status: 'In-Review',
    tags: ['Authors', 'Instructors', 'Uploads'],
    description: 'Guidelines for instructors publishing syllabi, courses, and projects.',
    sections: [
      {
        heading: 'Content quality',
        body: 'Uploaded materials must be original or properly licensed, clearly structured, and aligned with the stated learning outcomes.',
      },
      {
        heading: 'Approval workflow',
        body: 'Syllabi, online courses, and projects remain in review until HOA approves them. Rejected items must be revised and resubmitted.',
      },
      {
        heading: 'Payouts',
        body: 'Instructor payouts follow the pricing model selected at publish time. Payment history is available in the instructor performance area.',
      },
    ],
  },
  {
    id: 4,
    title: 'Community Engagement',
    status: 'Active',
    tags: ['Community', 'Stories', 'Moderation'],
    description: 'Rules for community stories, comments, and public-facing Academia content.',
    sections: [
      {
        heading: 'Publishing stories',
        body: 'Community stories should be accurate, appropriately tagged, and safe for all audiences. HOA may unpublish content that violates guidelines.',
      },
      {
        heading: 'Comments and feedback',
        body: 'Keep discussion constructive. HOA moderators may remove comments that are abusive, off-topic, or promotional spam.',
      },
    ],
  },
  {
    id: 5,
    title: 'Certificates Regulations',
    status: 'Active',
    tags: ['Certificates', 'Learners', 'Verification'],
    description: 'How certificate claims are reviewed, approved, and issued.',
    sections: [
      {
        heading: 'Verification',
        body: 'Each certificate claim is checked against enrollment records and assessment results before approval.',
      },
      {
        heading: 'Downloads',
        body: 'Approved certificates can be downloaded from the learner account and the HOA certificates queue. Pending claims show a waiting status.',
      },
    ],
  },
  {
    id: 6,
    title: 'Projects Regulations',
    status: 'Active',
    tags: ['Projects', 'Learners', 'Portfolio'],
    description: 'Standards for learner project uploads and HOA review.',
    sections: [
      {
        heading: 'Submissions',
        body: 'Projects must include a clear title, description, and supporting files. Incomplete or misleading submissions may be rejected.',
      },
      {
        heading: 'Review',
        body: 'HOA reviews projects for quality and policy compliance before they appear publicly in journals and author profiles.',
      },
    ],
  },
];
