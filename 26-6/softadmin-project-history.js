(function (root) {
	'use strict';
	const key = 'softadmin.mockup.projects.v1';
	const legacyKey = 'softadmin.mockup.savedPages.v1';
	const limit = 10;
	const validProject = project => project && typeof project.id === 'string' && project.state && typeof project.state.rootHtml === 'string';

	function read(storage) {
		const raw = storage.getItem(key);
		if (raw !== null) {
			const data = JSON.parse(raw);
			if (data?.version !== 1 || !Array.isArray(data.projects) || !data.projects.every(validProject)) {
				throw new Error('Saved project history cannot be read. Existing data has not been replaced.');
			}
			return data;
		}
		const legacy = JSON.parse(storage.getItem(legacyKey) || '[]');
		if (!Array.isArray(legacy)) throw new Error('Saved pages cannot be read. Existing data has not been replaced.');
		const projects = legacy.filter(validProject)
			.map(project => ({ ...project, updatedAt: project.savedAt, revision: `legacy-${project.id}` }))
			.sort((a, b) => (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0)).slice(0, limit);
		return { version: 1, activeId: projects[0]?.id || null, projects };
	}

	function upsert(data, project, expectedRevision) {
		const previous = data.projects.find(item => item.id === project.id);
		if ((previous?.revision || null) !== expectedRevision) {
			throw new Error('This project changed in another tab. Reload before editing further.');
		}
		return { version: 1, activeId: project.id, projects: [project, ...data.projects.filter(item => item.id !== project.id)].slice(0, limit) };
	}

	function write(storage, data) {
		storage.setItem(key, JSON.stringify(data));
	}

	root.SoftadminProjectHistory = { key, legacyKey, limit, read, upsert, write };
}(typeof window === 'undefined' ? globalThis : window));
