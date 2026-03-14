import React from 'react';

const TestComponent: React.FC = () => {
	return (
		<div style={{
			position: 'fixed',
			top: '50px',
			left: '50px',
			zIndex: 999,
			background: 'red',
			color: 'white',
			padding: '20px',
			border: '3px solid yellow',
			fontSize: '20px',
			fontWeight: 'bold'
		}}>
			🔴 REACT DZIAŁA! TEST COMPONENT 🔴
		</div>
	);
};

export default TestComponent;