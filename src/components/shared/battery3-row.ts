import { svg } from 'lit';
import { Utils } from '../../helpers/utils';
import { DataDto, sunsynkPowerFlowCardConfig } from '../../types';
import { UnitOfEnergy, UnitOfPower } from '../../const';
import { renderPath } from '../../helpers/render-path';
import { renderCircle } from '../../helpers/render-circle';
import { CustomEntity } from '../../inverters/dto/custom-entity';
import { localize } from '../../localize/localize';

type BatterySection = sunsynkPowerFlowCardConfig['battery2'];

const powerLabel = (
	power: number,
	autoScale: boolean,
	showAbsolute: boolean,
	decimals: number,
) => {
	const value = showAbsolute ? Math.abs(power) : power;
	if (autoScale) {
		return `${Utils.convertValue(value, decimals) || '0'}`;
	}
	return `${Utils.toNum(value, 0)} ${UnitOfPower.WATT}`;
};

const remainLabel = (
	energy: number,
	soc: CustomEntity,
	cfg: BatterySection,
	shutdown: number,
) => {
	if (!cfg?.show_remaining_energy || !energy || !soc?.isValid()) {
		return '';
	}
	const floor = cfg.remaining_energy_to_shutdown ? shutdown || 0 : 0;
	const usable = Math.max(soc.toNum() - floor, 0);
	return `${Utils.formatNumberLocale(
		Utils.toNum((energy * (usable / 100)) / 1000, 2),
		2,
	)} ${UnitOfEnergy.KILO_WATT_HOUR}`;
};

const runtimeText = (
	energy: number,
	power: number,
	invert: boolean,
	floating: boolean,
	capacity: number,
	formatted: string,
) => {
	if (floating) {
		return localize('common.battery_floating');
	}
	if (!energy || power === 0) {
		return '';
	}
	const discharging = invert ? power < 0 : power > 0;
	if (discharging) {
		return `${localize('common.runtime_to')} ${capacity}% @${formatted}`;
	}
	return `${localize('common.to')} ${capacity}% ${localize('common.charge')} @${formatted}`;
};

const oneBattery = (
	x: number,
	iconSize: number,
	iconY: number,
	colour: string,
	powerText: string,
	remain: string,
	socText: string,
	icon: string,
	onClick: (e) => void,
) => {
	const cx = x + iconSize / 2;
	return svg`
		<g style="cursor: pointer;" @click=${onClick}>
			<text x="${cx}" y="${iconY + 4}" class="st3" fill="${colour}">
				${socText}
			</text>
			<svg
				x="${x}"
				y="${iconY}"
				width="${iconSize}"
				height="${iconSize}"
				preserveAspectRatio="none"
				viewBox="0 0 24 24"
			>
				<path fill="${colour}" d="${icon}" />
			</svg>
			<text x="${cx}" y="${iconY + iconSize + 2}" class="st3" fill="${colour}">
				${powerText}
			</text>
			<text
				x="${cx}"
				y="${iconY + iconSize + 16}"
				class="remaining-energy"
				fill="${colour}"
			>
				${remain}
			</text>
		</g>
	`;
};

const leftLabels = (
	x: number,
	y: number,
	colour: string,
	socLine: string,
	duration: string,
	runtime: string,
	showDuration: boolean,
	largeFont: boolean,
) => svg`
	<text x="${x}" y="${y}" class="st13 st8 right-align" fill="${colour}">
		${socLine}
	</text>
	<text
		x="${x}"
		y="${y + 22}"
		class="${largeFont ? 'st4' : 'st14'} right-align"
		fill="${showDuration ? colour : 'transparent'}"
	>
		${duration}
	</text>
	<text x="${x}" y="${y + 38}" class="st3 right-align" fill="${colour}">
		${runtime}
	</text>
`;

/**
 * Dedicated row used only when battery.count is 3.
 * One- and two-battery graphics stay on the original layout.
 * Full mode follows the two-battery arrangement: shutdown and runtime
 * stay on the left for every pack, the third pack sits between the other
 * two, SOC replaces the temperature, watts sit under the icon and the
 * remaining energy moves down one line.
 */
export const renderBattery3Row = (
	data: DataDto,
	config: sunsynkPowerFlowCardConfig,
	mode: 'full' | 'compact',
) => {
	if (data.batteryCount !== 3 || !config.show_battery) {
		return svg``;
	}

	const full = mode === 'full';
	const icon = full ? 82 : 52;
	const iconY = full ? 294 : 312;
	const xs = full ? [122, 171, 220] : [133, 211, 289];
	const packs = [
		{
			colour: data.batteryColour,
			power: data.batteryPower,
			energy: data.batteryEnergy,
			icon: data.batteryIcon,
			soc: data.stateBatterySoc,
			cfg: config.battery,
			powerEntity: config.entities?.battery_power_190,
			socEntity: config.entities?.battery_soc_184,
			shutdown: data.batteryShutdown,
			duration: data.batteryDuration,
			formatted: data.formattedResultTime,
			capacity: data.batteryCapacity,
			floating: data.isFloating,
		},
		{
			colour: data.battery3Colour,
			power: data.battery3Power,
			energy: data.battery3Energy,
			icon: data.battery3Icon,
			soc: data.stateBattery3Soc,
			cfg: config.battery3,
			powerEntity: config.entities?.battery3_power_190,
			socEntity: config.entities?.battery3_soc_184,
			shutdown: data.batteryShutdown3,
			duration: data.batteryDuration3,
			formatted: data.formattedResultTime3,
			capacity: data.battery3Capacity,
			floating: data.isFloating3,
		},
		{
			colour: data.battery2Colour,
			power: data.battery2Power,
			energy: data.battery2Energy,
			icon: data.battery2Icon,
			soc: data.stateBattery2Soc,
			cfg: config.battery2,
			powerEntity: config.entities?.battery2_power_190,
			socEntity: config.entities?.battery2_soc_184,
			shutdown: data.batteryShutdown2,
			duration: data.batteryDuration2,
			formatted: data.formattedResultTime2,
			capacity: data.battery2Capacity,
			floating: data.isFloating2,
		},
	];

	const total = powerLabel(
		data.batteryPowerTotal,
		config.battery?.auto_scale !== false,
		!!config.battery?.show_absolute,
		data.decimalPlaces,
	);
	const totalColour = config.battery.dynamic_colour
		? data.flowBatColour
		: data.batteryColour;

	return svg`
		<g id="three_batteries">
			${
				full
					? svg`
							<g id="battery_total_power_three">
								<rect
									x="86"
									y="265"
									width="70"
									height="30"
									rx="4.5"
									ry="4.5"
									fill="none"
									stroke="${totalColour}"
									pointer-events="all"
								/>
								<text
									x="120"
									y="282"
									class="${data.largeFont !== true ? 'st14' : 'st4'} st8"
									fill="${data.batteryColour}"
								>
									${total}
								</text>
							</g>
							${leftLabels(
								108,
								328,
								packs[0].colour,
								packs[0].soc?.isValid()
									? `${Utils.formatNumberLocale(packs[0].shutdown || 0, 0)}% | ${Utils.formatNumberLocale(packs[0].soc.toNum(0), 0)}%`
									: '',
								packs[0].duration || '',
								runtimeText(
									packs[0].energy,
									packs[0].power,
									!!packs[0].cfg?.invert_flow,
									!!packs[0].floating,
									packs[0].capacity,
									packs[0].formatted || '',
								),
								packs[0].energy !== 0 && !packs[0].floating && packs[0].power !== 0,
								data.largeFont === true,
							)}
						`
					: svg`
							<text
								x="239"
								y="292"
								class="st14 st8"
								fill="${data.batteryColour}"
							>
								${total}
							</text>
						`
			}
			${packs.map(
				(pack, index) =>
					oneBattery(
						xs[index],
						icon,
						iconY,
						pack.colour,
						powerLabel(
							pack.power,
							pack.cfg?.auto_scale !== false,
							!!pack.cfg?.show_absolute,
							data.decimalPlaces,
						),
						remainLabel(pack.energy, pack.soc, pack.cfg, pack.shutdown),
						pack.soc?.isValid()
							? `${Utils.formatNumberLocale(pack.soc.toNum(0), 0)}%`
							: '',
						pack.icon,
						(e) =>
							pack.cfg?.navigate
								? Utils.handleNavigation(e, pack.cfg.navigate)
								: Utils.handlePopup(e, pack.powerEntity || pack.socEntity),
					),
			)}
			${
				mode === 'compact'
					? svg`
							<svg id="battery_flow_three">
								${renderPath(
									'bat-line',
									'M 239 250 L 239 306',
									true,
									totalColour,
									data.batLineWidth,
								)}
								${renderCircle(
									'power-dot-discharge',
									Math.min(
										2 + data.batLineWidth + Math.max(data.minLineWidth - 2, 0),
										8,
									),
									data.batteryPowerTotal < 0 || data.batteryPowerTotal === 0
										? 'transparent'
										: data.batteryColour,
									data.durationCur['battery'],
									'1;0',
									'#bat-line',
									config.battery.invert_flow === true,
								)}
								${renderCircle(
									'power-dot-charge',
									Math.min(
										2 + data.batLineWidth + Math.max(data.minLineWidth - 2, 0),
										8,
									),
									data.batteryPowerTotal > 0 || data.batteryPowerTotal === 0
										? 'transparent'
										: totalColour,
									data.durationCur['battery'],
									'0;1',
									'#bat-line',
									config.battery.invert_flow === true,
								)}
							</svg>
						`
					: svg``
			}
		</g>
	`;
};
