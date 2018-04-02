export default class MaterialProgress extends HTMLElement {

    static get observedAttributes() {
        return ['value', 'max'];
    }

    constructor() {
        super();

        const shadowRoot = this.attachShadow({mode: 'open'});

        shadowRoot.innerHTML = `
            <style>
                :host {
                    --progress-bar-width: 100%;
                    --progress-bar-height: 5px;
                    --progress-bar-color: rgb(0, 188, 212);
                    --progress-background: #eeeeee;
                    --progress-font-size: 4px;
                }
                progress[value]  {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    width: var(--progress-bar-width);
                    height: var(--progress-bar-height);
                    border: none;
                    color: var(--progress-bar-color); 
                }
                
                progress[value]::-webkit-progress-bar {
                    background-color: var(--progress-background);
                    border-radius: 2px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset;
                }
                progress[value]::-webkit-progress-value {
                    background-color: var(--progress-bar-color);
                }
                
                progress[value]::-moz-progress-bar {
                    background-color: var(--progress-bar-color);
                }
                
                #progress-container {
                    position: relative;
                    display: inline-block;
                    height: 5px;
                    margin-top: 20px;
                    overflow: visible;
                }
                #progress-container #progress-value {
                    width: var(--progress-value, 0%);
                    height: 20px;
                    position: absolute;
                    top: -7px;
                }
                #progress-value::after {
                    position: absolute;
                    content: attr(data-value) "%";
                    color: var(--progress-bar-color);
                }
                #circle {
                    box-sizing: border-box;
                    stroke: var(--progress-bar-color);
                    stroke-width: 3px;
                    transform-origin: 50%;
                    stroke-dashoffset: var(--dash-offset);
                    stroke-dasharray: var(--circle-circumference);
                    transform: rotate(-90deg);
                }
                #circle-container {
                    position: relative;
                }
                #circle-container #progress-value {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                }
                #circle-container  #progress-value::after {
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: var(--progress-font-size);
                }
            </style>
            
            <template id="regular">
                <div id="progress-container">
                    <div id="progress-value"></div>
                    <progress></progress>
                </div>
            </template>
            
            <template id="circular">
                <div id="circle-container">
                    <div id="progress-value"></div>
                    <svg>
                        <circle id="circle" fill="none"></circle>
                    </svg>
                </div>
            </template>
            
            <div id="container"></div>
        `;

        this.container = this.shadowRoot.querySelector('#container');
        this.regular = this.shadowRoot.querySelector('#regular').content.cloneNode(true);
        this.circular = this.shadowRoot.querySelector('#circular').content.cloneNode(true);

        if(this.hasAttribute('circle')) {
            this.container.appendChild(this.circular);
            this.circle = this.shadowRoot.querySelector('#circle');
            this.circleSize = parseInt(this.getAttribute('circle'), 10);
            this.radius = this.circleSize / 2;
            this.circle.setAttribute('cx', this.radius);
            this.circle.setAttribute('cy', this.radius);
            this.circle.setAttribute('r', this.radius - 2);
            this.circumference = 2 * Math.PI * (this.radius - 2);
            this.circleContainer = this.shadowRoot.querySelector('#circle-container');
            this.circleContainer.style.width = `${this.circleSize}px`;
            this.circleContainer.style.height = `${this.circleSize}px`;

            this.svg = this.shadowRoot.querySelector('svg');
            this.svg.setAttribute('width', this.circleSize);
            this.svg.setAttribute('height', this.circleSize);
            this.svg.setAttribute('viewBox', `0 0 ${this.circleSize} ${this.circleSize}`);

            this.circle.style.setProperty('--circle-circumference', this.circumference);
        }
        else {
            this.container.appendChild(this.regular);
            this.progress = this.shadowRoot.querySelector('progress');
        }

        this.progressValue = this.shadowRoot.querySelector('#progress-value');
        this.progressValue.style.setProperty('--progress-font-size', `${this.circleSize / 4}px`);
    }

    connectedCallback() {

    }

    attributeChangedCallback(attr, oldVal, newVal) {
        if(attr === 'value') {
            this.setProgressValue(newVal);
        }
        if(attr === 'max' && !this.hasAttribute('circle')) {
            this.progress.setAttribute('max', newVal);
        }
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(value) {
        this.setAttribute('value', value);
        this.setProgressValue(value);
    }

    setProgressValue(value) {
        if(this.hasAttribute('circle')) {
            this.circle.style.setProperty('--dash-offset', this.circumference * (1 - (value/100)));
        }
        else {
            this.progress.setAttribute('value', value);
            this.progressValue.style.setProperty('--progress-value', `${value}%`);
        }
        this.progressValue.dataset.value = value;
    }
}

customElements.define('material-progress', MaterialProgress);
