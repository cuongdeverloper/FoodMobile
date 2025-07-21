export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
  
    const res = await fetch(url, {
      headers: {
        "User-Agent": "YourAppName/1.0 (your@email.com)",
        "Accept-Language": "vi",
      },
    });
  
    if (!res.ok) {
      throw new Error("Failed to fetch address");
    }
  
    const data = await res.json();
  
    if (data.display_name) {
      return data.display_name;
    } else {
      throw new Error("No address found");
    }
  };
  