export const MenuList = [
    // Dashboard — সবার উপরে
    {
        title: 'Dashboard',
        classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-025-dashboard" />,
        content: [
            {
                title: 'Overview',
                to: 'dashboard',
            },
        ],
    },
    // Super Admin
    {
        title: 'Super Admin',
        classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-086-star" />,
        content: [
            {
                title: 'Admin Panel',
                to: 'manage-admins',
            },
            {
                title: 'Activity Monitor',
                to: 'activity-dashboard',
            },
        ],
    },
    // Museum
    {
        title: 'Museum',
        classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-013-checkmark" />,
        content: [
            {
                title: 'Entry Form',
                to: 'museum-entry',
            },
            {
                title: 'View Entries',
                to: 'museum-entries',
            },
        ]
    },
    // Camping
    {
        title: 'Camping',
        classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-050-info" />,
        content: [
            {
                title: 'Camping Management',
                to: 'camping-management',
            },
        ]
    },
    // Booking
    {
        title: 'Booking',
        classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-072-printer" />,
        content: [
            {
                title: 'Booking Form',
                to: 'booking',
            },
            {
                title: 'Booking List',
                to: 'booking-list',
            },
        ]
    },
]
