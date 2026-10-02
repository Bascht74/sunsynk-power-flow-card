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
	const viewWidth = config.wide ? 720 : 483;
	const viewHeight = config.wide ? (data.batteryCount === 3 ? 430 : 405) : 405;
	return html`
		<ha-card>
			${getDynamicStyles(data)}
			<div class="container card">
				${titleTemplate}
				<div
					class="flow-scale"
					style="width: ${data.cardWidth}; aspect-ratio: ${viewWidth} / ${viewHeight}; --flow-w: ${viewWidth}px;"
				>
					<svg
						viewBox="0 0 ${viewWidth} ${viewHeight}"
						preserveAspectRatio="xMidYMid meet"
						height="${viewHeight}"
						width="${viewWidth}"
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
					>
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
					</svg>
				</div>
			</div>
		</ha-card>
	`;
};
