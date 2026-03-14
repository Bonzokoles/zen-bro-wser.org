import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

interface FloatingWindowProps {
	url?: string;
	title: string;
	onClose: () => void;
	initialWidth?: number;
	initialHeight?: number;
	initialX?: number;
	initialY?: number;
	children?: React.ReactNode;
}

type WindowState = 'normal' | 'minimized' | 'maximized' | 'pip';

const FloatingWindow: React.FC<FloatingWindowProps> = ({
	url,
	title,
	onClose,
	initialWidth = 800,
	initialHeight = 600,
	initialX = 100,
	initialY = 100,
	children
}) => {
	const [windowState, setWindowState] = useState<WindowState>('normal');
	const [position, setPosition] = useState({ x: initialX, y: initialY });
	const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
	const [isDragging, setIsDragging] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const [resizeDirection, setResizeDirection] = useState<string>('');
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [savedState, setSavedState] = useState({ position, size });

	const windowRef = useRef<HTMLDivElement>(null);

	// Handle dragging
	const handleMouseDown = (e: React.MouseEvent) => {
		if (windowState === 'maximized') return;
		setIsDragging(true);
		setDragOffset({
			x: e.clientX - position.x,
			y: e.clientY - position.y
		});
	};

	// Handle resize start
	const handleResizeStart = (e: React.MouseEvent, direction: string) => {
		e.stopPropagation();
		if (windowState === 'maximized') return;
		setIsResizing(true);
		setResizeDirection(direction);
	};

	// Mouse move handler
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (isDragging) {
				setPosition({
					x: e.clientX - dragOffset.x,
					y: e.clientY - dragOffset.y
				});
			}

			if (isResizing) {
				const newSize = { ...size };
				const newPosition = { ...position };

				if (resizeDirection.includes('e')) {
					newSize.width = Math.max(300, e.clientX - position.x);
				}
				if (resizeDirection.includes('s')) {
					newSize.height = Math.max(200, e.clientY - position.y);
				}
				if (resizeDirection.includes('w')) {
					const newWidth = Math.max(300, size.width - (e.clientX - position.x));
					newPosition.x = position.x + (size.width - newWidth);
					newSize.width = newWidth;
				}
				if (resizeDirection.includes('n')) {
					const newHeight = Math.max(200, size.height - (e.clientY - position.y));
					newPosition.y = position.y + (size.height - newHeight);
					newSize.height = newHeight;
				}

				setSize(newSize);
				setPosition(newPosition);
			}
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			setIsResizing(false);
			setResizeDirection('');
		};

		if (isDragging || isResizing) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging, isResizing, dragOffset, position, size, resizeDirection]);

	// Toggle maximize
	const toggleMaximize = () => {
		if (windowState === 'maximized') {
			setWindowState('normal');
			setPosition(savedState.position);
			setSize(savedState.size);
		} else {
			setSavedState({ position, size });
			setWindowState('maximized');
		}
	};

	// Toggle minimize
	const toggleMinimize = () => {
		if (windowState === 'minimized') {
			setWindowState('normal');
		} else {
			setSavedState({ position, size });
			setWindowState('minimized');
		}
	};

	// Toggle PIP (Picture-in-Picture)
	const togglePIP = () => {
		if (windowState === 'pip') {
			setWindowState('normal');
			setPosition(savedState.position);
			setSize(savedState.size);
		} else {
			setSavedState({ position, size });
			setWindowState('pip');
			setPosition({ x: window.innerWidth - 420, y: window.innerHeight - 320 });
			setSize({ width: 400, height: 300 });
		}
	};

	// Get window styles based on state
	const getWindowStyles = (): React.CSSProperties => {
		const baseStyles: React.CSSProperties = {
			position: 'fixed',
			backgroundColor: '#1e293b',
			borderRadius: windowState === 'maximized' ? '0' : '12px',
			boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
			display: 'flex',
			flexDirection: 'column',
			zIndex: 1000,
			overflow: 'hidden',
			border: '1px solid rgba(148, 163, 184, 0.3)'
		};

		if (windowState === 'maximized') {
			return {
				...baseStyles,
				top: '80px',
				left: 0,
				width: '100%',
				height: 'calc(100% - 80px - 70px)',
				borderRadius: '0'
			};
		}

		if (windowState === 'minimized') {
			return {
				...baseStyles,
				bottom: '90px',
				left: '20px',
				width: '250px',
				height: '50px',
				cursor: 'pointer'
			};
		}

		return {
			...baseStyles,
			top: `${position.y}px`,
			left: `${position.x}px`,
			width: `${size.width}px`,
			height: `${size.height}px`
		};
	};

	// Resize handles
	const ResizeHandle = ({ direction, cursor }: { direction: string; cursor: string }) => (
		<div
			onMouseDown={(e) => handleResizeStart(e, direction)}
			style={{
				position: 'absolute',
				...(direction.includes('n') && { top: 0 }),
				...(direction.includes('s') && { bottom: 0 }),
				...(direction.includes('w') && { left: 0 }),
				...(direction.includes('e') && { right: 0 }),
				...((direction === 'n' || direction === 's') && { 
					width: '100%', 
					height: '8px',
					cursor: 'ns-resize'
				}),
				...((direction === 'w' || direction === 'e') && { 
					width: '8px', 
					height: '100%',
					cursor: 'ew-resize'
				}),
				...((direction === 'nw' || direction === 'se') && { 
					width: '16px', 
					height: '16px',
					cursor: 'nwse-resize'
				}),
				...((direction === 'ne' || direction === 'sw') && { 
					width: '16px', 
					height: '16px',
					cursor: 'nesw-resize'
				}),
				zIndex: 10
			}}
		/>
	);

	if (windowState === 'minimized') {
		return (
			<div style={getWindowStyles()} onClick={toggleMinimize}>
				<div style={{
					padding: '12px 16px',
					display: 'flex',
					alignItems: 'center',
					gap: '12px',
					cursor: 'pointer'
				}}>
					<span style={{ fontSize: '20px' }}>🌐</span>
					<span style={{ 
						color: 'white', 
						fontSize: '14px',
						fontWeight: '500',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap'
					}}>
						{title}
					</span>
				</div>
			</div>
		);
	}

	return (
		<div ref={windowRef} style={getWindowStyles()}>
			{/* Title Bar */}
			<div
				onMouseDown={handleMouseDown}
				style={{
					backgroundColor: '#0f172a',
					padding: '12px 16px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					cursor: windowState === 'maximized' ? 'default' : 'move',
					borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
					userSelect: 'none'
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
					<span style={{ fontSize: '20px' }}>🌐</span>
					<div style={{ flex: 1, overflow: 'hidden' }}>
						<div style={{ 
							color: 'white', 
							fontSize: '14px',
							fontWeight: '500',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap'
						}}>
							{title}
						</div>
						<div style={{ 
							color: '#94a3b8', 
							fontSize: '11px',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							marginTop: '2px'
						}}>
							{url || 'Local Motif Process'}
						</div>
					</div>
				</div>

				{/* Window Controls */}
				<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
					{/* PIP Button */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							togglePIP();
						}}
						style={{
							background: windowState === 'pip' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
							border: 'none',
							color: '#94a3b8',
							cursor: 'pointer',
							width: '32px',
							height: '32px',
							borderRadius: '6px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: '16px',
							transition: 'all 0.2s'
						}}
						onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.2)'}
						onMouseLeave={(e) => e.currentTarget.style.backgroundColor = windowState === 'pip' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}
						title="Picture-in-Picture"
					>
						📺
					</button>

					{/* Minimize Button */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							toggleMinimize();
						}}
						style={{
							background: 'transparent',
							border: 'none',
							color: '#94a3b8',
							cursor: 'pointer',
							width: '32px',
							height: '32px',
							borderRadius: '6px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: '20px',
							transition: 'all 0.2s'
						}}
						onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.2)'}
						onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
						title="Minimize"
					>
						−
					</button>

					{/* Maximize Button */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							toggleMaximize();
						}}
						style={{
							background: windowState === 'maximized' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
							border: 'none',
							color: '#94a3b8',
							cursor: 'pointer',
							width: '32px',
							height: '32px',
							borderRadius: '6px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: '16px',
							transition: 'all 0.2s'
						}}
						onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.2)'}
						onMouseLeave={(e) => e.currentTarget.style.backgroundColor = windowState === 'maximized' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}
						title="Maximize"
					>
						{windowState === 'maximized' ? '⊡' : '□'}
					</button>

					{/* Close Button */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							onClose();
						}}
						style={{
							background: 'transparent',
							border: 'none',
							color: '#94a3b8',
							cursor: 'pointer',
							width: '32px',
							height: '32px',
							borderRadius: '6px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: '20px',
							transition: 'all 0.2s'
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = '#ef4444';
							e.currentTarget.style.color = 'white';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = 'transparent';
							e.currentTarget.style.color = '#94a3b8';
						}}
						title="Close"
					>
						✕
					</button>
				</div>
			</div>

			{/* Content Area */}
			<div style={{ 
				flex: 1, 
				position: 'relative',
				backgroundColor: children ? 'transparent' : 'white',
				overflow: 'hidden',
				pointerEvents: (isDragging || isResizing) ? 'none' : 'auto'
			}}>
				{children ? children : url && (
					<iframe
						src={url}
						style={{
							width: '100%',
							height: '100%',
							border: 'none'
						}}
						title={title}
						sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
					/>
				)}
			</div>

			{/* Resize Handles (only in normal state) */}
			{windowState === 'normal' && (
				<>
					<ResizeHandle direction="n" cursor="ns-resize" />
					<ResizeHandle direction="s" cursor="ns-resize" />
					<ResizeHandle direction="w" cursor="ew-resize" />
					<ResizeHandle direction="e" cursor="ew-resize" />
					<ResizeHandle direction="nw" cursor="nwse-resize" />
					<ResizeHandle direction="ne" cursor="nesw-resize" />
					<ResizeHandle direction="sw" cursor="nesw-resize" />
					<ResizeHandle direction="se" cursor="nwse-resize" />
				</>
			)}
		</div>
	);
};

export default FloatingWindow;
