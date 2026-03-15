import React, { useState, useRef, useEffect } from 'react';

interface FloatingWindowProps {
	url?: string;
	children?: React.ReactNode;
	title: string;
	icon?: string;
	onClose: () => void;
	zIndex?: number;
	initialWidth?: number;
	initialHeight?: number;
	initialX?: number;
	initialY?: number;
}

type WindowState = 'normal' | 'minimized' | 'maximized' | 'pip';

const FloatingWindow: React.FC<FloatingWindowProps> = ({
	url,
	children,
	title,
	icon,
	onClose,
	zIndex,
	initialWidth = 800,
	initialHeight = 600,
	initialX = 100,
	initialY = 100
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

	// Get window classes based on state
	const getWindowClasses = () => {
		const baseClasses = "fixed bg-slate-800 rounded-xl shadow-2xl flex flex-col z-[1000] overflow-hidden border border-slate-700/30";

		if (windowState === 'maximized') {
			return `${baseClasses} top-[80px] left-0 w-full h-[calc(100%-150px)] rounded-none`;
		}

		if (windowState === 'minimized') {
			return `${baseClasses} bottom-[90px] left-5 w-[250px] h-[50px] cursor-pointer`;
		}

		return baseClasses;
	};

	// Resize handles
	const ResizeHandle = ({ direction, cursor }: { direction: string; cursor: string }) => {
		const getStyles = () => {
			const base = "absolute z-10";
			if (direction === 'n') return `${base} top-0 w-full h-2 cursor-ns-resize`;
			if (direction === 's') return `${base} bottom-0 w-full h-2 cursor-ns-resize`;
			if (direction === 'w') return `${base} left-0 w-2 h-full cursor-ew-resize`;
			if (direction === 'e') return `${base} right-0 w-2 h-full cursor-ew-resize`;
			if (direction === 'nw') return `${base} top-0 left-0 w-4 h-4 cursor-nwse-resize`;
			if (direction === 'ne') return `${base} top-0 right-0 w-4 h-4 cursor-nesw-resize`;
			if (direction === 'sw') return `${base} bottom-0 left-0 w-4 h-4 cursor-nesw-resize`;
			if (direction === 'se') return `${base} bottom-0 right-0 w-4 h-4 cursor-nwse-resize`;
			return base;
		};

		return (
			<div
				onMouseDown={(e) => handleResizeStart(e, direction)}
				className={getStyles()}
			/>
		);
	};

	const isResizable = windowState === 'normal' || windowState === 'pip';

	if (windowState === 'minimized') {
		return (
			<div
				className={getWindowClasses()}
				onClick={toggleMinimize}
				style={isResizable ? {
					top: `${position.y}px`,
					left: `${position.x}px`,
					width: `${size.width}px`,
					height: `${size.height}px`
				} : undefined}
			>
				<div className="px-4 py-3 flex items-center gap-3 cursor-pointer">
					<span className="text-xl">{icon ?? '🌐'}</span>
					<span className="text-white text-sm font-medium truncate">
						{title}
					</span>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={windowRef}
			className={getWindowClasses()}
			style={isResizable ? {
				top: `${position.y}px`,
				left: `${position.x}px`,
				width: `${size.width}px`,
				height: `${size.height}px`,
				...(zIndex ? { zIndex } : {})
			} : undefined}
		>
			{/* Title Bar */}
			<div
				onMouseDown={handleMouseDown}
				className={`bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-700/20 select-none
					${windowState === 'maximized' ? 'cursor-default' : 'cursor-move'}`}
			>
				<div className="flex items-center gap-3 flex-1 overflow-hidden">
					<span className="text-xl">{icon ?? '🌐'}</span>
					<div className="flex-1 overflow-hidden">
						<div className="text-white text-sm font-medium truncate">
							{title}
						</div>
						{url && (
							<div className="text-slate-400 text-[11px] truncate mt-0.5">
								{url}
							</div>
						)}
					</div>
				</div>

				{/* Window Controls */}
				<div className="flex gap-2 items-center">
					{/* PIP Button */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							togglePIP();
						}}
						className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-colors
							${windowState === 'pip' ? 'bg-blue-500/30 text-blue-400' : 'text-slate-400 hover:bg-slate-700/50'}`}
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
						className="w-8 h-8 rounded-md flex items-center justify-center text-xl text-slate-400 hover:bg-slate-700/50 transition-colors"
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
						className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-colors
							${windowState === 'maximized' ? 'bg-blue-500/30 text-blue-400' : 'text-slate-400 hover:bg-slate-700/50'}`}
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
						className="w-8 h-8 rounded-md flex items-center justify-center text-xl text-slate-400 hover:bg-red-500 hover:text-white transition-colors"
						title="Close"
					>
						✕
					</button>
				</div>
			</div>

			{/* Content Area */}
			<div className="flex-1 relative overflow-hidden" style={{ background: children ? undefined : 'white' }}>
				{children ? (
					<div className="w-full h-full overflow-auto">
						{children}
					</div>
				) : (
					<iframe
						src={url}
						className="w-full h-full border-none"
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
