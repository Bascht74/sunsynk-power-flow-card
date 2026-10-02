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
	shell: string,
	charge: string,
	stopColour: string,
	gradient: boolean,
	gid: string,
	onClick: (e) => void,
) => {
	const cx = x + iconSize / 2;
	const iconX = x + iconSize / 6;
	return svg`
		<g style="cursor: pointer;" @click=${onClick}>
			<text x="${cx}" y="${iconY + 3}" class="st3" fill="${colour}">
				${socText}
			</text>
			<svg
				x="${iconX}"
				y="${iconY + 2}"
				width="${iconSize}"
				height="${iconSize}"
				preserveAspectRatio="none"
				viewBox="0 0 24 24"
			>
				<path fill="${colour}" d="${gradient ? shell : icon}" />
				<defs>
					<linearGradient id="${gid}" x1="0%" x2="0%" y1="100%" y2="0%">
						<stop offset="0%" stop-color="red" />
						<stop offset="100%" stop-color="${stopColour}" />
					</linearGradient>
				</defs>
				<path
					fill="${gradient ? `url(#${gid})` : colour}"
					display="${gradient ? '' : 'none'}"
					d="${charge}"
				/>
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
	shutdownText: string,
	socText: string,
	onSoc: ((e) => void) | null,
	duration: string,
	runtime: string,
	showDuration: boolean,
	largeFont: boolean,
) => svg`
	<text x="${x}" y="${y}" class="st13 st8 right-align" fill="${colour}">
		${shutdownText}${shutdownText && socText ? ' | ' : ''}${
			onSoc
				? svg`<a href="#" @click=${onSoc}><tspan>${socText}</tspan></a>`
				: svg`<tspan>${socText}</tspan>`
		}
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
			shell: data.battery0,
			charge: data.batteryCharge,
			stop: data.stopColour,
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
			shell: data.battery30,
			charge: data.battery3Charge,
			stop: data.stop3Colour,
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
			shell: data.battery20,
			charge: data.battery2Charge,
			stop: data.stop2Colour,
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

	const totalEntity = config.entities?.battery_power_total;
	const totalFromEntity =
		!!totalEntity && !['none', 'no', 'zero'].includes(totalEntity);
	const totalWatts =
		totalFromEntity && data.stateBatteryPowerTotal?.isValid()
			? data.stateBatteryPowerTotal.toNum()
			: data.batteryPowerTotal;
	const total = powerLabel(
		totalWatts,
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
								${
									totalFromEntity
										? svg`<a
											href="#"
											@click=${(e) => Utils.handlePopup(e, totalEntity)}
										>
											<rect
												x="83.32"
												y="265"
												width="70"
												height="30"
												rx="4.5"
												ry="4.5"
												fill="transparent"
												stroke="${totalColour}"
												pointer-events="all"
											/>
											<text
												x="117.32"
												y="282"
												class="${data.largeFont !== true ? 'st14' : 'st4'} st8"
												fill="${data.batteryColour}"
											>
												${total}
											</text>
										</a>`
										: svg`<rect
											x="83.32"
											y="265"
											width="70"
											height="30"
											rx="4.5"
											ry="4.5"
											fill="none"
											stroke="${totalColour}"
										/>
										<text
											x="117.32"
											y="282"
											class="${data.largeFont !== true ? 'st14' : 'st4'} st8"
											fill="${data.batteryColour}"
										>
											${total}
										</text>`
								}
							</g>
							${(() => {
								const socHistory = Utils.historyPath([
									config.entities?.battery_soc_184,
									config.entities?.battery2_soc_184,
									config.entities?.battery3_soc_184,
								]);
								const shutdownText = packs[0].soc?.isValid()
									? `${Utils.formatNumberLocale(packs[0].shutdown || 0, 0)}%`
									: '';
								const socText = packs[0].soc?.isValid()
									? `${Utils.formatNumberLocale(packs[0].soc.toNum(0), 0)}%`
									: '';
								return leftLabels(
									130,
									328,
									packs[0].colour,
									shutdownText,
									socText,
									socHistory
										? (e) => Utils.handleNavigation(e, socHistory)
										: null,
									packs[0].duration || '',
									runtimeText(
										packs[0].energy,
										packs[0].power,
										!!packs[0].cfg?.invert_flow,
										!!packs[0].floating,
										packs[0].capacity,
										packs[0].formatted || '',
									),
									packs[0].energy !== 0 &&
										!packs[0].floating &&
										packs[0].power !== 0,
									data.largeFont === true,
								);
							})()}
							${(() => {
								const one = (value: number, suffix: string) =>
									`${Utils.formatNumberLocale(value, 1)}${suffix}`;
								const reading = (
									entity: string | undefined,
									text: string,
									index: number,
								) => {
									const linked =
										!!entity && !['none', 'no', 'zero'].includes(entity);
									const value = linked
										? svg`<a href="#" @click=${(e) => Utils.handlePopup(e, entity)}
											><tspan>${text}</tspan></a
										>`
										: svg`<tspan>${text}</tspan>`;
									return svg`${
										index ? svg`<tspan style="font-size:13px"> • </tspan>` : ''
									}${value}`;
								};
								const volts = [
									[config.entities?.battery_voltage_183, data.batteryVoltage],
									[config.entities?.battery3_voltage_183, data.battery3Voltage],
									[config.entities?.battery2_voltage_183, data.battery2Voltage],
								].map(([entity, value], index) =>
									reading(
										entity as string,
										one(Number(value) || 0, ' V'),
										index,
									),
								);
								const amps = [
									[
										config.entities?.battery_current_191,
										data.stateBatteryCurrent,
									],
									[
										config.entities?.battery3_current_191,
										data.stateBattery3Current,
									],
									[
										config.entities?.battery2_current_191,
										data.stateBattery2Current,
									],
								].map(([entity, value], index) =>
									reading(
										entity as string,
										one(
											(value as { toNum?: (n: number) => number })?.toNum?.(
												1,
											) ?? 0,
											' A',
										),
										index,
									),
								);
								const temps = [
									[config.entities?.battery_temp_182, data.stateBatteryTemp],
									[config.entities?.battery3_temp_182, data.stateBattery3Temp],
									[config.entities?.battery2_temp_182, data.stateBattery2Temp],
								].map(([entity, value], index) =>
									reading(
										entity as string,
										one(
											(value as { toNum?: (n: number) => number })?.toNum?.(
												1,
											) ?? 0,
											'°',
										),
										index,
									),
								);
								return svg`
									<g id="battery_pack_readings">
										<rect
											x="287.6"
											y="320.75"
											width="116"
											height="50"
											rx="4.5"
											ry="4.5"
											fill="none"
											stroke="${packs[0].colour}"
											pointer-events="all"
										/>
										<text x="345.6" y="329.5" class="st3 st8" fill="${packs[0].colour}">${volts}</text>
										<text x="345.6" y="345.75" class="st3 st8" fill="${packs[0].colour}">${amps}</text>
										<text x="345.6" y="362" class="st3 st8" fill="${packs[0].colour}">${temps}</text>
									</g>
								`;
							})()}
						`
					: totalFromEntity
						? svg`<a href="#" @click=${(e) => Utils.handlePopup(e, totalEntity)}>
							<text
								x="239"
								y="292"
								class="st14 st8"
								fill="${data.batteryColour}"
							>
								${total}
							</text>
						</a>`
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
			${packs.map((pack, index) =>
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
					pack.shell,
					pack.charge,
					pack.stop,
					!!pack.cfg?.linear_gradient,
					`sLg-row-${index}`,
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
