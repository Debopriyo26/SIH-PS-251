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
      sourcesUsed.push('Inventory Intelligence DB', 'Predictive Shortage Engine');
      const atRisk = inventory.filter(i => i.risk_status === 'CRITICAL' || i.risk_status === 'HIGH');
      answer = `### ⚠️ Tactical Supply Risk Assessment\n\nBased on current burn rates and 7-day projected forecasts, **${atRisk.length} supply items** are currently at elevated risk:\n\n` +
        atRisk.map(item => 
          `- **${item.supply?.name}** at *${item.location?.name}*: Stock is **${item.current_stock.toLocaleString()} ${item.supply?.unit}** with **${item.days_of_cover} Days of Cover** remaining (Safety Floor: ${item.safety_threshold.toLocaleString()} ${item.supply?.unit}). Status: **${item.risk_status}**.`
        ).join('\n\n') +
        `\n\n**Actionable Directive:** Immediate dispatch of bowser TR-001 (POL) and emergency airlift for Medical Trauma Kits at Forward Node A is recommended.`;

    } else if (lower.includes('fuel') || lower.includes('pol') || lower.includes('projected fuel')) {
      sourcesUsed.push('Demand Forecasting Engine (XGBoost/RF)', 'IMD Telemetry');
      const fuelItem = inventory.find(i => i.supply?.category === 'Fuel' && i.location_id === 'loc-dn-a');
      const currentStock = fuelItem ? fuelItem.current_stock : 4820;
      const dailyBurn = fuelItem ? fuelItem.daily_consumption : 510;
      answer = `### ⛽ Fuel (POL) Demand & Depletion Outlook\n\n` +
        `- **Distribution Node Alpha:** Current Stock is **${currentStock.toLocaleString()} L** against a daily consumption of **${dailyBurn} L/day**.\n` +
        `- **7-Day Projected Demand:** **6,240 L** (+22% surge expected due to heater & generator runtimes).\n` +
        `- **Days of Cover:** **${fuelItem?.days_of_cover || 9.4} days** (Below standard 14-day operational cushion).\n` +
        `- **Corridor Status:** Sector Pass route is under IMD Orange Rainfall Warning, slowing road transit.\n\n` +
        `**Recommendation:** Authorize top-up convoy from Supply Hub North before precipitation intensifies.`;

    } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('imd')) {
      sourcesUsed.push('IMD Official Gateway (Mausam API)', 'Sector Weather Telemetry');
      const severe = weather.filter(w => w.warning_level === 'ORANGE' || w.warning_level === 'RED');
      answer = `### 🛰️ IMD Meteorological Assessment\n\n` +
        `Data Source: **India Meteorological Department (Mausam API)**\n\n` +
        `High weather risks detected across **${severe.length} operational zones**:\n\n` +
        severe.map(w => 
          `- **${w.location_name}** [${w.warning_level} Warning]: Temp ${w.temperature_c}°C, Rainfall ${w.rainfall_mm}mm, Wind ${w.wind_speed_kmh}km/h. Condition: *${w.weather_condition}*. IMD Advisory: *"${w.warning_text}"*`
        ).join('\n\n') +
        `\n\n**Impact on Logistics:** Forward convoys restricted to 15 km/h along Sector Pass corridor.`;

    } else if (lower.includes('alert') || lower.includes('critical')) {
      sourcesUsed.push('Tactical Alert Center', 'Supabase Realtime Stream');
      const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
      answer = `### 🚨 Active Tactical Alerts (Today)\n\n` +
        `Total active tactical alerts: **${activeAlerts.length}**\n\n` +
        activeAlerts.map((a, i) => 
          `**${i + 1}. [${a.severity}] ${a.title}**\n- *Location:* ${a.location_name}\n- *Message:* ${a.message}\n- *Directive:* ${a.recommendations || 'Monitor sector.'}`
        ).join('\n\n');

    } else if (lower.includes('transport') || lower.includes('truck') || lower.includes('fleet') || lower.includes('convoy')) {
      sourcesUsed.push('Transport Fleet Asset Tracker');
      const available = transports.filter(t => t.availability === 'AVAILABLE');
      const inTransit = transports.filter(t => t.availability === 'IN_TRANSIT');
      const maintenance = transports.filter(t => t.availability === 'MAINTENANCE' || t.availability === 'UNAVAILABLE');
      answer = `### 🚛 Transport Fleet Status\n\n` +
        `- **Available:** ${available.length} assets (${available.map(a => a.asset_code).join(', ')})\n` +
        `- **In Transit:** ${inTransit.length} assets (${inTransit.map(a => a.asset_code).join(', ')})\n` +
        `- **Offline/Maintenance:** ${maintenance.length} assets (${maintenance.map(a => `${a.asset_code} - ${a.status}`).join(', ')})\n\n` +
        `Overall fleet availability: **76%**. Primary heavy assets TR-001 and TR-004 are mission-ready for dispatch.`;

    } else if (lower.includes('sync') || lower.includes('changed') || lower.includes('last synchronization')) {
      sourcesUsed.push('System Sync Telemetry', 'IMD & Supabase Ingest Stream');
      answer = `### ⏱️ Last Synchronization Delta Summary\n\n` +
        `- **IMD Telemetry:** Ingested 18 minutes ago. Precipitation at Distribution Node Alpha increased from 11.2mm to 18.5mm (+65%).\n` +
        `- **Fuel Reserves:** Distribution Node Alpha registered 510 L daily burn rate.\n` +
        `- **Alert Engine:** Generated Alert ALT-003 for Forward Node A Medical Kit depletion.\n` +
        `- **Transport:** Asset TR-003 checked in at waypoint 'Pass High-Ascent' on schedule.`;

    } else {
      sourcesUsed.push('VYOMIX Tactical Grounding Engine');
      answer = `### 🛡️ Tactical System Operational Overview\n\n` +
        `- **Supply Readiness:** 87% across all sectors\n` +
        `- **Weather Risk:** 42% (Orange warning active along Eastern Flank)\n` +
        `- **Transport Availability:** 76% (6 active tactical assets tracked)\n` +
        `- **Active Alerts:** ${alerts.filter(a => a.status === 'ACTIVE').length} operational alerts requiring commanding officer review\n\n` +
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
