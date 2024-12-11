export async function POST(req) {
  try {
    const { currentSection } = await req.json();
    return new Response(JSON.stringify({ success: true, currentSection }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
