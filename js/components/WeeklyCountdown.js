import { store } from '../store.js';

/**
 * WeeklyCountdown — Counts down from Monday 6AM to Friday 11:59:59PM
 * On weekends: shows "CYCLE COMPLETE" with winning clan
 */
export default function createWeeklyCountdown() {
    const widget = document.createElement('div');
    widget.className = 'weekly-countdown';

    function getLeadingClan() {
        const clans = Object.values(store.getState().clans);
        if (clans.length === 0) return { name: '???', points: 0 };
        return [...clans].sort((a, b) => b.points - a.points)[0];
    }

    function getTimeRemaining() {
        const now = new Date();
        const day = now.getDay(); // 0=Sun, 1=Mon...6=Sat

        // Weekend check (Saturday=6 or Sunday=0)
        if (day === 0 || day === 6) {
            return { completed: true, days: 0, hours: 0, mins: 0, secs: 0 };
        }

        // Calculate end: Friday 11:59:59 PM of this week
        const friday = new Date(now);
        const daysUntilFriday = 5 - day; // Friday = 5
        friday.setDate(now.getDate() + daysUntilFriday);
        friday.setHours(23, 59, 59, 999);

        const diff = friday.getTime() - now.getTime();
        if (diff <= 0) {
            return { completed: true, days: 0, hours: 0, mins: 0, secs: 0 };
        }

        const secs = Math.floor((diff / 1000) % 60);
        const mins = Math.floor((diff / 1000 / 60) % 60);
        const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
        const days = Math.floor(diff / 1000 / 60 / 60 / 24);

        return { completed: false, days, hours, mins, secs };
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    function render() {
        const time = getTimeRemaining();
        const leader = getLeadingClan();

        if (time.completed) {
            widget.innerHTML = `
                <div class="countdown-header">
                    <i class="fa-solid fa-trophy"></i> CYCLE COMPLETE
                </div>
                <div class="countdown-winner">
                    <span class="winner-label">WEEKLY CHAMPION</span>
                    <span class="winner-name">${leader.name.toUpperCase()}</span>
                    <span class="winner-pts">${leader.points.toLocaleString()} PTS</span>
                </div>
            `;
        } else {
            widget.innerHTML = `
                <div class="countdown-header">
                    <i class="fa-solid fa-clock"></i> CYCLE ENDS IN
                </div>
                <div class="countdown-digits">
                    <div class="cd-unit">
                        <span class="cd-num">${pad(time.days)}</span>
                        <span class="cd-label">DAYS</span>
                    </div>
                    <span class="cd-sep">:</span>
                    <div class="cd-unit">
                        <span class="cd-num">${pad(time.hours)}</span>
                        <span class="cd-label">HRS</span>
                    </div>
                    <span class="cd-sep">:</span>
                    <div class="cd-unit">
                        <span class="cd-num">${pad(time.mins)}</span>
                        <span class="cd-label">MIN</span>
                    </div>
                    <span class="cd-sep">:</span>
                    <div class="cd-unit">
                        <span class="cd-num">${pad(time.secs)}</span>
                        <span class="cd-label">SEC</span>
                    </div>
                </div>
                <div class="countdown-leader">
                    <i class="fa-solid fa-crown"></i>
                    <span>${leader.name.toUpperCase()} — ${leader.points.toLocaleString()} PTS</span>
                </div>
            `;
        }
    }

    render();
    const interval = setInterval(() => {
        if (!widget.isConnected) { clearInterval(interval); return; }
        render();
    }, 1000);

    return widget;
}
