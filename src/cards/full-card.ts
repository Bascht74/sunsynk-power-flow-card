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
	const viewW = config.wide ? 720 : 483;
	const viewH = config.wide && data.batteryCount === 3 ? 430 : 405;
	const frameWidth =
		!data.cardWidth || data.cardWidth === '100%'
			? `min(100%, calc((100svh - 96px) * ${viewW} / ${viewH}))`
			: data.cardWidth;
	return html`
		<ha-card>
			${getDynamicStyles(data)}
			<div class="container card">
				${titleTemplate}
				<div
					class="flow-frame"
					style="width: ${frameWidth}; aspect-ratio: ${viewW} / ${viewH}; margin-inline: auto; --flow-w: ${viewW}px;"
				>
					<svg
						viewBox="0 0 ${viewW} ${viewH}"
						preserveAspectRatio="xMidYMid meet"
						height="${viewH}"
						width="${viewW}"
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
