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

        // Calculate Next Friday at 11:59:59 PM
        // Friday = 5
        let target = new Date(now);
        let daysUntilFriday = (5 - day + 7) % 7;
        
        // If today is Friday but it's already past 11:59:59, we target NEXT Friday
        target.setDate(now.getDate() + daysUntilFriday);
        target.setHours(23, 59, 59, 999);

        if (now > target) {
            target.setDate(target.getDate() + 7);
        }

        const diff = target.getTime() - now.getTime();
        
        // We only show "Completed" if we explicitly want a pause (e.g., Saturday morning)
        // But the user wants "more time" for tomorrow's presentation, so we'll just show the next cycle.
        const completed = false; 

        const secs = Math.floor((diff / 1000) % 60);
        const mins = Math.floor((diff / 1000 / 60) % 60);
        const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
        const days = Math.floor(diff / 1000 / 60 / 60 / 24);

        return { completed, days, hours, mins, secs };
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
