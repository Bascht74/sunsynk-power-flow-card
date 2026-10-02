import { html } from 'lit';
import { cache } from 'lit/directives/cache.js';
import { keyed } from 'lit/directives/keyed.js';
import { DataDto, sunsynkPowerFlowCardConfig } from '../types';
import { renderSolarElements } from '../components/compact/pv/pv-elements';
import { renderBatteryElements } from '../components/compact/bat/bat-elements';
import { renderGridElements } from '../components/compact/grid/grid-elements';
import { renderLoadElements } from '../components/compact/load/load-elements';
import { renderInverterElements } from '../components/compact/inverter/inverter-elements';
import { getDynamicStyles } from '../style';

export const compactCard = (
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
					html`
						<h1
							style="text-align: center; color: ${
								config.title_colour || 'inherit'
							}; font-size: ${config.title_size || '32px'};"
						>
							${config.title}
						</h1>
					`,
				),
			)
		: '';
	const viewWidth = config.wide ? 720 : Number(data.viewBoxWidthLite);
	const viewHeight = config.wide ? 405 : Number(data.viewBoxHeightLite);
	const viewX = config.wide ? 0 : data.viewBoxXLite;
	const viewY = config.wide ? 0 : data.viewBoxYLite;
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
						viewBox="${viewX} ${viewY} ${viewWidth} ${viewHeight}"
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

						<!-- Inverter Elements -->
						${renderInverterElements(data, inverterImg, config)}
					</svg>
				</div>
			</div>
		</ha-card>
	`;
};
