"use server";



export async function create_doc(payload) {
  try {
    const response = await fetch("http://localhost:5000/api/doctors/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to synchronize profile records.",
      };
    }

    return {
      success: true,
      message: "Profile synchronized successfully!",
      data: data.data,
    };
  } catch (error) {
    console.error("Error connecting from Next.js to Express server:", error);
    return {
      success: false,
      message: "Could not reach the backend server pipeline.",
    };
  }
}