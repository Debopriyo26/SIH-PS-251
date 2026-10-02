import { ChatMessage } from '../types';
import { inventoryService } from './inventoryService';
import { weatherService } from './weatherService';
import { alertService } from './alertService';
import { transportService } from './transportService';

class AssistantService {
  public async query(prompt: string): Promise<ChatMessage> {
    const lower = prompt.toLowerCase();
    const inventory = await inventoryService.getInventory();
    const weather = await weatherService.getObservations();
    const alerts = await alertService.getAlerts();
    const transports = await transportService.getTransports();

    let answer = '';
    const sourcesUsed: string[] = [];

    if (lower.includes('supplies') && (lower.includes('risk') || lower.includes('shortage'))) {
      sourcesUsed.push('Inventory Ledger', 'Predictive Shortage Engine');
      const atRisk = inventory.filter(i => i.risk_status === 'CRITICAL' || i.risk_status === 'HIGH');
      answer = `### ⚠️ Supply Risk Overview\n\nBased on current consumption rates and 7-day projected forecasts, **${atRisk.length} supply items** are currently at elevated risk:\n\n` +
        atRisk.map(item => 
          `- **${item.supply?.name}** at *${item.location?.name}*: Stock is **${item.current_stock.toLocaleString()} ${item.supply?.unit}** with **${item.days_of_cover} Days of Cover** remaining (Safety Floor: ${item.safety_threshold.toLocaleString()} ${item.supply?.unit}). Status: **${item.risk_status}**.`
        ).join('\n\n') +
        `\n\n**Actionable Directive:** Immediate dispatch of carrier TR-001 (POL) from Ahmedabad Base to Srinagar Zone is recommended.`;

    } else if (lower.includes('fuel') || lower.includes('pol') || lower.includes('projected fuel')) {
      sourcesUsed.push('Demand Forecasting Engine', 'IMD Telemetry');
      const fuelItem = inventory.find(i => i.supply?.category === 'Fuel' && i.location_id === 'loc-srinagar');
      const currentStock = fuelItem ? fuelItem.current_stock : 4820;
      const dailyBurn = fuelItem ? fuelItem.daily_consumption : 510;
      answer = `### ⛽ Fuel Demand & Depletion Outlook\n\n` +
        `- **Srinagar Logistics Zone:** Current Stock is **${currentStock.toLocaleString()} L** against daily consumption of **${dailyBurn} L/day**.\n` +
        `- **7-Day Projected Demand:** **6,240 L** (+22% surge expected due to heating requirements).\n` +
        `- **Days of Cover:** **${fuelItem?.days_of_cover || 9.4} days** (Below standard 14-day cushion).\n` +
        `- **Corridor Status:** Northern mountain pass is under an IMD Orange Precipitation Advisory, slowing transit.\n\n` +
        `**Recommendation:** Authorize top-up convoy from Ahmedabad Logistics Base before weather intensifies.`;

    } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('imd')) {
      sourcesUsed.push('IMD Mausam Gateway', 'Station Telemetry');
      const severe = weather.filter(w => w.warning_level === 'ORANGE' || w.warning_level === 'RED');
      answer = `### 🛰️ IMD Meteorological Summary\n\n` +
        `Data Source: **India Meteorological Department (Mausam API)**\n\n` +
        `Elevated weather risk detected in **${severe.length} operational zones**:\n\n` +
        severe.map(w => 
          `- **${w.location_name}** [${w.warning_level} Warning]: Temp ${w.temperature_c}°C, Rainfall ${w.rainfall_mm}mm, Wind ${w.wind_speed_kmh}km/h. Condition: *${w.weather_condition}*. Advisory: *"${w.warning_text}"*`
        ).join('\n\n');

    } else if (lower.includes('alert') || lower.includes('critical')) {
      sourcesUsed.push('Alert Center', 'Realtime Stream');
      const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
      answer = `### 🚨 Active Logistics Alerts\n\n` +
        `Total active alerts: **${activeAlerts.length}**\n\n` +
        activeAlerts.map((a, i) => 
          `**${i + 1}. [${a.severity}] ${a.title}**\n- *Location:* ${a.location_name}\n- *Message:* ${a.message}\n- *Recommendation:* ${a.recommendations || 'Monitor situation.'}`
        ).join('\n\n');

    } else {
      sourcesUsed.push('VYOMIX Intelligence Engine');
      answer = `### 🛡️ Logistics Operations Overview\n\n` +
        `- **Overall Supply Readiness:** 87% across demonstration zones\n` +
        `- **Weather Risk:** 42% (Orange warning active in northern mountain zone)\n` +
        `- **Transport Availability:** 76% (4 active transport assets tracked)\n` +
        `- **Active Alerts:** ${alerts.filter(a => a.status === 'ACTIVE').length} operational alerts requiring attention\n\n` +
        `You can ask specific questions such as:\n` +
        `• *"Which supplies are currently at risk?"*\n` +
        `• *"What is the projected fuel demand?"*\n` +
        `• *"Which locations have elevated weather risk?"*\n` +
        `• *"Show today's critical alerts."*`;
    }

    return {
      id: 'msg-' + Date.now(),
      role: 'assistant',
      content: answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
      sourcesUsed,
      suggestedPrompts: [
        'Which supplies are currently at risk?',
        'What is the projected fuel demand?',
        'Which locations have elevated weather risk?',
        "Show today's critical alerts."
      ]
    };
  }
}

export const assistantService = new AssistantService();
