(function (global) {
	function clone(value) {
		return JSON.parse(JSON.stringify(value));
	}

	function minutes(value) {
		const match = String(value || '').match(/^(\d{1,2}):(\d{2})$/);
		return match ? Number(match[1]) * 60 + Number(match[2]) : null;
	}

	function time(value) {
		const total = Math.max(0, Math.min(1439, Math.round(Number(value) || 0)));
		return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
	}

	function componentAt(spec, location) {
		return spec?.components?.[Number(location.componentIndex)];
	}

	function collectionAt(spec, location) {
		const component = componentAt(spec, location);
		if (!component) return null;

		if (location.kind === 'resource') {
			const resource = component.resourceColumns?.[Number(location.resourceIndex)];
			if (!resource) return null;
			resource.activities = Array.isArray(resource.activities) ? resource.activities : [];
			return resource.activities;
		}

		const day = component.weeks?.[Number(location.weekIndex)]?.days?.[Number(location.dayIndex)];
		if (!day) return null;
		day.activities = Array.isArray(day.activities) ? day.activities : [];
		return day.activities;
	}

	function applyTiming(activity, target) {
		const previousRange = activity.start && activity.end ? `${activity.start}-${activity.end}` : '';
		delete activity.top;
		delete activity.height;

		if (target.allDay) {
			activity.allDay = true;
			delete activity.start;
			delete activity.end;
			if (activity.time === previousRange) delete activity.time;
			if (activity.description === previousRange) delete activity.description;
			return;
		}

		const oldStart = minutes(activity.start);
		const oldEnd = minutes(activity.end);
		const duration = oldStart !== null && oldEnd !== null && oldEnd > oldStart ? oldEnd - oldStart : 60;
		const nextStart = minutes(target.start) ?? oldStart ?? 540;
		activity.allDay = false;
		activity.start = time(nextStart);
		activity.end = time(nextStart + duration);
		const nextRange = `${activity.start}-${activity.end}`;
		if (activity.time === previousRange) activity.time = nextRange;
		if (activity.description === previousRange) activity.description = nextRange;
	}

	function moveActivity(spec, source, target) {
		const next = clone(spec);
		const sourceCollection = collectionAt(next, source);
		const targetCollection = collectionAt(next, target);
		const activityIndex = Number(source.activityIndex);

		if (!sourceCollection || !targetCollection || !sourceCollection[activityIndex]) {
			return null;
		}

		const [activity] = sourceCollection.splice(activityIndex, 1);
		applyTiming(activity, target);
		targetCollection.push(activity);
		return next;
	}

	function addActivity(spec, target, values) {
		const next = clone(spec);
		const collection = collectionAt(next, target);
		if (!collection) return null;

		const activity = {
			title: String(values?.title || '').trim() || 'New activity'
		};
		if (String(values?.description || '').trim()) activity.description = String(values.description).trim();
		if (values?.color) activity.color = values.color;
		if (!target.allDay) {
			activity.start = values?.start || target.start || '09:00';
			activity.end = values?.end || time((minutes(activity.start) ?? 540) + 60);
		}
		activity.allDay = Boolean(target.allDay);
		collection.push(activity);
		return next;
	}

	global.SoftadminCalendarEditor = { addActivity, moveActivity, minutes, time };
}(typeof window !== 'undefined' ? window : globalThis));
