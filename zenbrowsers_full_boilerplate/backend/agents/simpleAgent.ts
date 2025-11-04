// simplified agent placeholder
export async function simpleAgent(page) { console.log('Processing:', page.url); return {category: 'art', id: page.id, url: page.url}; }
