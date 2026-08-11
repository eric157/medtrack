import { NextResponse } from 'next/server';

/**
 * Google Tasks API Sync Endpoint
 * Accepts refill items and target stock days, formats tasks payload,
 * and makes OAuth 2.0 REST API calls to Google Tasks API:
 * POST https://tasks.googleapis.com/tasks/v1/lists/@default/tasks
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetDaysSupply = 30, refillItems = [] } = body;

    const googleAccessToken = process.env.GOOGLE_ACCESS_TOKEN;

    if (!googleAccessToken) {
      // Return simulated success response with clear instruction when OAuth token is not configured in env
      return NextResponse.json({
        success: true,
        mode: 'simulation',
        message: 'Refill tasks calculated and formatted. Google Tasks API is ready. (Add GOOGLE_ACCESS_TOKEN to .env for direct live REST sync).',
        tasksCreated: refillItems.map((item: any) => ({
          title: `Refill ${item.medicationName} for ${item.patientName} (${item.refillQuantityNeeded} pills)`,
          notes: `Current Stock: ${item.currentStock} pills. Days Remaining: ${item.daysLeft}. Target: ${targetDaysSupply} days supply. Depletion Date: ${item.depletionDate}`,
          dueDate: item.depletionDate
        }))
      });
    }

    // Call live Google Tasks API
    const googleTaskResults = [];
    for (const item of refillItems) {
      const taskPayload = {
        title: `💊 Refill: ${item.medicationName} (${item.patientName})`,
        notes: `MedTrack Auto-Refill Alert: Need ${item.refillQuantityNeeded} pills to achieve ${targetDaysSupply}-day supply. Est. Depletion: ${item.depletionDate}.`,
        due: `${item.depletionDate}T09:00:00.000Z`
      };

      const response = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskPayload)
      });

      if (response.ok) {
        const result = await response.json();
        googleTaskResults.push(result);
      }
    }

    return NextResponse.json({
      success: true,
      mode: 'live',
      syncedCount: googleTaskResults.length,
      tasks: googleTaskResults
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
