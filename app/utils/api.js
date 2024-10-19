export async function deleteItem(itemPath, itemType) {
  const response = await fetch('/api/delete-item', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ itemPath, itemType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete item');
  }

  return response.json();
}
