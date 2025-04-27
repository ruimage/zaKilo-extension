export class BaseParser {
    constructor(strategy) {
        this.strategy = strategy;
        this.scrollTimeoutId = null;
        this.mutationObserver = null;
        this.intervalId = null;
        this.onScroll = this.onScroll.bind(this);
        this.onMutation = this.onMutation.bind(this);
    }

    init() {
        this.strategy.log('=== BaseParser.init ===');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        this.runAll('init');
        this.setupMutationObserver();
        this.setupScrollListener();
        this.setupInterval(5000);
    }

    runAll(source) {
        const selector = this.strategy.getCardSelector();
        const cards = Array.from(document.querySelectorAll(selector));
        this.strategy.log(`${source}: found ${cards.length} cards`);
        cards
            .filter(el => this.strategy.shouldProcess(el))
            .forEach(el => this.tryProcess(el, source));
    }

    tryProcess(el, source) {
        this.strategy.log(`tryProcess [${source}]`);
        try {
            this.strategy.process(el);
            this.strategy.log(`✓ [${source}] success`);
        } catch (err) {
            this.strategy.log(`✗ [${source}] error:`, err.message);
        }
    }

    setupMutationObserver() {
        this.mutationObserver = new MutationObserver(this.onMutation);
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        this.strategy.log('MutationObserver started');
    }

    onMutation(mutations) {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (!(node instanceof HTMLElement)) return;
                if (node.matches(this.strategy.getCardSelector())) {
                    this.tryProcess(node, 'MO');
                }
                node.querySelectorAll(this.strategy.getCardSelector())
                    .forEach(el => this.tryProcess(el, 'MO'));
            });
        });
    }

    setupScrollListener() {
        window.addEventListener('scroll', this.onScroll, { passive: true });
        this.strategy.log('Scroll listener started');
    }

    onScroll() {
        if (this.scrollTimeoutId !== null) {
            clearTimeout(this.scrollTimeoutId);
        }
        this.scrollTimeoutId = window.setTimeout(() => this.runAll('scroll'), 300);
    }

    setupInterval(ms) {
        this.intervalId = window.setInterval(() => this.runAll('interval'), ms);
        this.strategy.log(`Interval runAll every ${ms}ms`);
    }

    destroy() {
        if (this.mutationObserver) this.mutationObserver.disconnect();
        if (this.scrollTimeoutId !== null) clearTimeout(this.scrollTimeoutId);
        if (this.intervalId !== null) clearInterval(this.intervalId);
        window.removeEventListener('scroll', this.onScroll);
        this.strategy.log('BaseParser destroyed');
    }
}
