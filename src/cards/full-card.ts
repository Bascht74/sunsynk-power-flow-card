import { html } from 'lit';
import { cache } from 'lit/directives/cache.js';
import { keyed } from 'lit/directives/keyed.js';
import { DataDto, sunsynkPowerFlowCardConfig } from '../types';
import { getDynamicStyles } from '../style';
import { renderSolarElements } from '../components/full/pv/pv_elements';
import { renderBatteryElements } from '../components/full/bat/bat-elements';
import { renderGridElements } from '../components/full/grid/grid-elements';
import { renderLoadElements } from '../components/full/load/load-elements';
import { renderAuxLoadElements } from '../components/full/auxload/aux-elements';
import { renderInverterElements } from '../components/full/inverter/inverter-elements';

export const fullCard = (
	config: sunsynkPowerFlowCardConfig,
	inverterImg: string,
	data: DataDto,
) => {
	const titleKey = config.title
		? `${config.title}|${config.title_colour ?? ''}|${config.title_size ?? ''}`
		: 'no-title';
	const titleTemplate = config.title
		? cache(
				keyed(
					titleKey,
					html`<h1
						style="text-align: center; color: ${
							config.title_colour || 'inherit'
						}; font-size: ${config.title_size || '32px'};"
					>
						${config.title}
					</h1>`,
				),
			)
		: '';
	const phone = data.phoneLayout === true;
	const desktopViewBox = config.wide
		? data.batteryCount === 3
			? '0 0 720 430'
			: '0 0 720 405'
		: '0 0 483 405';
	const svgBody = html`
		<!-- Solar Elements -->
		${renderSolarElements(data, config)}

		<!-- Battery Elements -->
		${renderBatteryElements(data, config)}

		<!-- Grid Elements -->
		${renderGridElements(data, config)}

		<!-- Load Elements -->
		${renderLoadElements(data, config)}

		<!-- AUX Elements -->
		${renderAuxLoadElements(data, config)}

		<!-- Inverter Elements -->
		${renderInverterElements(data, inverterImg, config)}
	`;
	const graphic = phone
		? html`<div
				class="flow-scale"
				style="width: ${data.cardWidth}; aspect-ratio: 402 / 874; --flow-w: 402px;"
			>
				<svg
					viewBox="0 0 402 874"
					preserveAspectRatio="xMidYMid meet"
					height="874"
					width="402"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
				>
					${svgBody}
				</svg>
			</div>`
		: html`<svg
				viewBox="${desktopViewBox}"
				preserveAspectRatio="xMidYMid meet"
				height="${data.cardHeight}"
				width="${data.cardWidth}"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
			>
				${svgBody}
			</svg>`;
	return html`
		<ha-card>
			${getDynamicStyles(data)}
			<div class="container card">
				${titleTemplate}
				${graphic}
			</div>
		</ha-card>
	`;
};
