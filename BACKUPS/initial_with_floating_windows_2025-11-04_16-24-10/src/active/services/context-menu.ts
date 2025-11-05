// src/active/services/context-menu.ts

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: (selection: string) => Promise<void>;
  condition?: (selection: string) => boolean;
}

export class AIContextMenu {
  items: ContextMenuItem[] = [
    {
      id: 'summarize',
      label: 'Summarize',
      icon: '📝',
      action: async (text) => {
        // Simulate AI response
        const summary = `(AI Summary) ${text.substring(0, 50)}...`;
        this.showResult('Summary', summary);
      },
      condition: (text) => text.length > 100
    },
    {
      id: 'translate',
      label: 'Translate to English',
      icon: '🌐',
      action: async (text) => {
        // Simulate AI response
        const translated = `(AI Translation) ${text}`; // In a real app, call AI translation service
        this.showResult('Translation', translated);
      }
    },
    {
      id: 'explain',
      label: 'Explain',
      icon: '💡',
      action: async (text) => {
        // Simulate AI response
        const explanation = `(AI Explanation) ${text}`; // In a real app, call AI explanation service
        this.showResult('Explanation', explanation);
      }
    },
    {
      id: 'define',
      label: 'Define',
      icon: '📖',
      action: async (text) => {
        // Simulate AI response
        const definition = `(AI Definition) ${text}`; // In a real app, call AI definition service
        this.showResult('Definition', definition);
      },
      condition: (text) => text.split(' ').length <= 5 // Define single words or short phrases
    },
    {
      id: 'rewrite',
      label: 'Improve Writing',
      icon: '✍️',
      action: async (text) => {
        // Simulate AI response
        const improved = `(AI Improved) ${text}`; // In a real app, call AI rewrite service
        this.showResult('Improved Writing', improved);
      }
    }
  ];

  // This method would typically be called by the UI layer
  // It creates and appends the context menu to the body
  show(x: number, y: number, selection: string) {
    const menu = document.createElement('div');
    menu.className = 'ai-context-menu'; // Use a class for styling
    menu.style.position = 'absolute';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.backgroundColor = '#2d3748'; // Dark background
    menu.style.border = '1px solid #4a5568';
    menu.style.borderRadius = '8px';
    menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    menu.style.zIndex = '9999';
    menu.style.padding = '8px 0';
    menu.style.minWidth = '180px';

    const itemsToShow = this.items.filter(item =>
      !item.condition || item.condition(selection)
    );

    if (itemsToShow.length === 0) {
      return; // Don't show menu if no items are applicable
    }

    menu.innerHTML = itemsToShow.map(item => `
      <button
        data-id="${item.id}"
        style="
          display: flex; align-items: center; gap: 10px; padding: 10px 15px;
          width: 100%; text-align: left; background: none; border: none;
          color: white; font-size: 14px; cursor: pointer;
          transition: background-color 0.2s ease;
        "
        onmouseover="this.style.backgroundColor='#4a5568'"
        onmouseout="this.style.backgroundColor='none'"
      >
        ${item.icon || ''} ${item.label}
      </button>
    `).join('');

    menu.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const id = target.dataset.id;
      const item = itemsToShow.find(i => i.id === id);

      if (item) {
        await item.action(selection);
        menu.remove();
      }
    });

    document.body.appendChild(menu);

    // Remove on click outside
    const removeMenu = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove();
        document.removeEventListener('click', removeMenu);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', removeMenu);
    }, 0);
  }

  private showResult(title: string, content: string) {
    // This would ideally be a proper modal component in React
    alert(`${title}:

${content}`);
  }
}
