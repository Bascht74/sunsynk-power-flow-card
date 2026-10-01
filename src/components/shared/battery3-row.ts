import { svg } from 'lit';
import { Utils } from '../../helpers/utils';
import { DataDto, sunsynkPowerFlowCardConfig } from '../../types';
import {
	UnitOfElectricalCurrent,
	UnitOfElectricPotential,
	UnitOfEnergy,
	UnitOfPower,
} from '../../const';
import { renderPath } from '../../helpers/render-path';
import { renderCircle } from '../../helpers/render-circle';
import { CustomEntity } from '../../inverters/dto/custom-entity';

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

const oneBattery = (
	data: DataDto,
	x: number,
	iconSize: number,
	iconY: number,
	indexLabel: string,
	colour: string,
	power: number,
	voltage: number,
	energy: number,
	icon: string,
	soc: CustomEntity,
	current: CustomEntity,
	temp: CustomEntity,
	cfg: BatterySection,
	powerEntity: string,
	socEntity: string,
) => {
	const cx = x + iconSize / 2;
	const socText = soc?.isValid()
		? `${Utils.formatNumberLocale(soc.toNum(0), 0)}%`
		: '';
	const remain =
		cfg?.show_remaining_energy && energy
			? `${Utils.formatNumberLocale(
					Utils.toNum((energy * (soc.toNum() / 100)) / 1000, 1),
					1,
				)} ${UnitOfEnergy.KILO_WATT_HOUR}`
			: '';
	const volts =
		voltage > 0
			? `${Utils.formatNumberLocale(voltage, 1)} ${UnitOfElectricPotential.VOLT}`
			: '';
	const amps = current?.isValid()
		? `${Utils.formatNumberLocale(
				cfg?.show_absolute ? Math.abs(current.toNum(1)) : current.toNum(1),
				1,
			)} ${UnitOfElectricalCurrent.AMPERE}`
		: '';
	const open = (e) =>
		cfg?.navigate
			? Utils.handleNavigation(e, cfg.navigate)
			: Utils.handlePopup(e, powerEntity || socEntity);

	return svg`
		<g id="battery${indexLabel}_third" style="cursor: pointer;" @click=${open}>
			<text
				x="${x + 4}"
				y="${iconY - 6}"
				class="st3 left-align"
				fill="${colour}"
			>
				${indexLabel}
			</text>
			${
				temp?.isValid()
					? svg`<text x="${cx}" y="${iconY - 2}" class="st3" fill="${colour}">
							${Utils.formatNumberLocale(temp.toNum(1), 1)}°
						</text>`
					: svg``
			}
			<svg
				x="${x}"
				y="${iconY}"
				width="${iconSize}"
				height="${iconSize}"
				viewBox="0 0 24 24"
			>
				<path fill="${colour}" d="${icon}" />
			</svg>
			<text
				x="${cx}"
				y="${iconY + iconSize * 0.62}"
				class="st10"
				fill="${colour}"
			>
				${socText}
			</text>
			<text x="${cx}" y="${iconY + iconSize + 14}" class="st3" fill="${colour}">
				${powerLabel(
					power,
					cfg?.auto_scale !== false,
					!!cfg?.show_absolute,
					data.decimalPlaces,
				)}
			</text>
			<text x="${cx}" y="${iconY + iconSize + 26}" class="st3" fill="${colour}">
				${volts}${amps ? ` · ${amps}` : ''}
			</text>
			<text x="${cx}" y="${iconY + iconSize + 38}" class="st3" fill="${colour}">
				${remain}
			</text>
		</g>
	`;
};

/**
 * Dedicated row used only when battery.count is 3.
 * One- and two-battery graphics stay on the original layout.
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
	const icon = full ? 64 : 52;
	const iconY = full ? 292 : 312;
	const xs = full ? [16, 108, 200] : [133, 211, 289];
	const slots = [
		{
			x: xs[0],
			label: '1',
			colour: data.batteryColour,
			power: data.batteryPower,
			voltage: data.batteryVoltage,
			energy: data.batteryEnergy,
			icon: data.batteryIcon,
			soc: data.stateBatterySoc,
			current: data.stateBatteryCurrent,
			temp: data.stateBatteryTemp,
			cfg: config.battery,
			powerEntity: config.entities?.battery_power_190,
			socEntity: config.entities?.battery_soc_184,
		},
		{
			x: xs[1],
			label: '2',
			colour: data.battery2Colour,
			power: data.battery2Power,
			voltage: data.battery2Voltage,
			energy: data.battery2Energy,
			icon: data.battery2Icon,
			soc: data.stateBattery2Soc,
			current: data.stateBattery2Current,
			temp: data.stateBattery2Temp,
			cfg: config.battery2,
			powerEntity: config.entities?.battery2_power_190,
			socEntity: config.entities?.battery2_soc_184,
		},
		{
			x: xs[2],
			label: '3',
			colour: data.battery3Colour,
			power: data.battery3Power,
			voltage: data.battery3Voltage,
			energy: data.battery3Energy,
			icon: data.battery3Icon,
			soc: data.stateBattery3Soc,
			current: data.stateBattery3Current,
			temp: data.stateBattery3Temp,
			cfg: config.battery3,
			powerEntity: config.entities?.battery3_power_190,
			socEntity: config.entities?.battery3_soc_184,
		},
	];

	const totalX = full ? 136 : 239;
	const totalY = full ? 258 : 292;
	const total = powerLabel(
		data.batteryPowerTotal,
		config.battery?.auto_scale !== false,
		!!config.battery?.show_absolute,
		data.decimalPlaces,
	);

	return svg`
		<g id="three_batteries">
			<text
				x="${totalX}"
				y="${totalY}"
				class="st14 st8"
				fill="${data.batteryColour}"
			>
				${total}
			</text>
			${slots.map((slot) =>
				oneBattery(
					data,
					slot.x,
					icon,
					iconY,
					slot.label,
					slot.colour,
					slot.power,
					slot.voltage,
					slot.energy,
					slot.icon,
					slot.soc,
					slot.current,
					slot.temp,
					slot.cfg,
					slot.powerEntity,
					slot.socEntity,
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
									config.battery.dynamic_colour
										? data.flowBatColour
										: data.batteryColour,
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
										: config.battery.dynamic_colour
											? data.flowBatColour
											: data.batteryColour,
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
