import React, { useState, useEffect } from 'react';

interface TreeNode {
	type: 'folder' | 'file';
	name: string;
	path?: string;
	children?: TreeNode[];
}

interface LocalSearchResultsProps {
	query: string;
}

const LocalSearchResults: React.FC<LocalSearchResultsProps> = ({ query }) => {
	const [results, setResults] = useState<TreeNode[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<string | null>(null);
	const [fileContent, setFileContent] = useState<string>('');

	useEffect(() => {
		const searchFiles = async () => {
			setLoading(true);
			setError(null);
			
			try {
				// Pobierz całe drzewo katalogów
				const response = await fetch('/api/cayd/catalogTree');
				if (!response.ok) throw new Error('Błąd pobierania danych');
				
				const tree: TreeNode[] = await response.json();
				
				// Filtruj pliki według zapytania
				const filtered = filterTree(tree, query.toLowerCase());
				setResults(filtered);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Nieznany błąd');
			} finally {
				setLoading(false);
			}
		};

		if (query.trim()) {
			searchFiles();
		} else {
			setResults([]);
			setLoading(false);
		}
	}, [query]);

	// Funkcja rekurencyjnie przeszukująca drzewo
	const filterTree = (nodes: TreeNode[], searchQuery: string): TreeNode[] => {
		const filtered: TreeNode[] = [];

		for (const node of nodes) {
			if (node.type === 'file') {
				// Sprawdź czy nazwa pliku zawiera zapytanie
				if (node.name.toLowerCase().includes(searchQuery)) {
					filtered.push(node);
				}
			} else if (node.type === 'folder' && node.children) {
				// Rekurencyjnie przeszukaj podfoldery
				const childResults = filterTree(node.children, searchQuery);
				if (childResults.length > 0) {
					filtered.push(...childResults);
				}
			}
		}

		return filtered;
	};

	const loadFileContent = async (path: string) => {
		try {
			const response = await fetch(`/api/cayd/fileContent?path=${encodeURIComponent(path)}`);
			if (!response.ok) throw new Error('Błąd ładowania pliku');
			
			const data = await response.json();
			setFileContent(data.content);
			setSelectedFile(path);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Błąd ładowania pliku');
		}
	};

	if (loading) {
		return (
			<div style={{
				padding: '60px 20px',
				textAlign: 'center',
				color: '#64748b'
			}}>
				<div style={{
					fontSize: '48px',
					marginBottom: '20px'
				}}>🔍</div>
				<h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Wyszukiwanie...</h2>
				<p>Przeszukuję bibliotekę dla: "{query}"</p>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{
				padding: '60px 20px',
				textAlign: 'center',
				color: '#ef4444'
			}}>
				<div style={{
					fontSize: '48px',
					marginBottom: '20px'
				}}>⚠️</div>
				<h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Błąd</h2>
				<p>{error}</p>
			</div>
		);
	}

	if (results.length === 0) {
		return (
			<div style={{
				padding: '60px 20px',
				textAlign: 'center',
				color: '#64748b'
			}}>
				<div style={{
					fontSize: '48px',
					marginBottom: '20px'
				}}>📭</div>
				<h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Brak wyników</h2>
				<p>Nie znaleziono plików dla zapytania: "{query}"</p>
				<p style={{ marginTop: '20px', fontSize: '14px' }}>
					Spróbuj użyć innych słów kluczowych lub sprawdź pisownię.
				</p>
			</div>
		);
	}

	return (
		<div style={{
			display: 'flex',
			height: '100vh',
			background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
			color: '#e2e8f0'
		}}>
			{/* Lista wyników - lewa strona */}
			<div style={{
				width: '40%',
				borderRight: '1px solid #334155',
				overflowY: 'auto',
				padding: '20px'
			}}>
				<div style={{
					marginBottom: '20px',
					paddingBottom: '15px',
					borderBottom: '2px solid #10b981'
				}}>
					<h2 style={{
						fontSize: '20px',
						fontWeight: '600',
						marginBottom: '8px'
					}}>
						🔍 Wyniki wyszukiwania
					</h2>
					<p style={{
						fontSize: '14px',
						color: '#94a3b8'
					}}>
						Znaleziono: <strong style={{ color: '#10b981' }}>{results.length}</strong> plików dla "{query}"
					</p>
				</div>

				<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
					{results.map((node, index) => (
						<div
							key={index}
							onClick={() => node.path && loadFileContent(node.path)}
							style={{
								padding: '12px 16px',
								background: selectedFile === node.path 
									? 'linear-gradient(135deg, #10b981, #059669)' 
									: '#1e293b',
								border: `1px solid ${selectedFile === node.path ? '#10b981' : '#334155'}`,
								borderRadius: '8px',
								cursor: 'pointer',
								transition: 'all 0.2s ease',
								display: 'flex',
								alignItems: 'center',
								gap: '10px'
							}}
							onMouseEnter={(e) => {
								if (selectedFile !== node.path) {
									e.currentTarget.style.background = '#334155';
								}
							}}
							onMouseLeave={(e) => {
								if (selectedFile !== node.path) {
									e.currentTarget.style.background = '#1e293b';
								}
							}}
						>
							<span style={{ fontSize: '20px' }}>📄</span>
							<div style={{ flex: 1 }}>
								<div style={{ 
									fontSize: '15px', 
									fontWeight: '500',
									marginBottom: '4px'
								}}>
									{node.name}
								</div>
								<div style={{ 
									fontSize: '12px', 
									color: selectedFile === node.path ? '#d1fae5' : '#64748b',
									fontFamily: 'monospace'
								}}>
									{node.path}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Podgląd zawartości - prawa strona */}
			<div style={{
				width: '60%',
				padding: '20px',
				overflowY: 'auto'
			}}>
				{selectedFile ? (
					<div>
						<div style={{
							marginBottom: '20px',
							paddingBottom: '15px',
							borderBottom: '2px solid #3b82f6'
						}}>
							<h3 style={{
								fontSize: '18px',
								fontWeight: '600',
								marginBottom: '8px'
							}}>
								📄 Podgląd pliku
							</h3>
							<p style={{
								fontSize: '13px',
								color: '#94a3b8',
								fontFamily: 'monospace'
							}}>
								{selectedFile}
							</p>
						</div>

						<pre style={{
							background: '#0f172a',
							border: '1px solid #334155',
							borderRadius: '8px',
							padding: '20px',
							fontSize: '14px',
							lineHeight: '1.6',
							whiteSpace: 'pre-wrap',
							wordWrap: 'break-word',
							color: '#e2e8f0'
						}}>
							{fileContent}
						</pre>
					</div>
				) : (
					<div style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						height: '100%',
						color: '#64748b',
						textAlign: 'center'
					}}>
						<div style={{ fontSize: '64px', marginBottom: '20px' }}>👈</div>
						<h3 style={{ fontSize: '20px', marginBottom: '10px' }}>
							Wybierz plik z listy
						</h3>
						<p style={{ fontSize: '14px' }}>
							Kliknij na dowolny wynik, aby zobaczyć jego zawartość
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default LocalSearchResults;
