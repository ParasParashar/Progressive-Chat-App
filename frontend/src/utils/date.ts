const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];
export const formatDayOnly = (date: string) => {
    const dateOnly = new Date(date)
    const currentDate = days[new Date().getDay()];
    const day = days[dateOnly.getDay()]
    if (day === currentDate) {
        return 'Today';
    } else {
        return dateOnly.toLocaleDateString([], {
            day: "2-digit",
            month: "short",
            year: 'numeric'
        });
    }
};
export const formatDateForSidebar = (date: string) => {
    const dateOnly = new Date(date)
    const currentDate = days[new Date().getDay()];
    const day = days[dateOnly.getDay()]
    if (day === currentDate) {
        return dateOnly.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    } else {
        return dateOnly.toLocaleDateString([], {
            day: "2-digit",
            month: "short",
            year: 'numeric'
        });
    }
};


export const formatMessageDate = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })
}
export const formatGroupDate = (date: string) => {
    return new Date(date).toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: 'numeric'
    });
}
