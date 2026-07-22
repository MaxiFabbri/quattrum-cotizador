export async function getAccessToken() {
    const clientId = import.meta.env.VITE_XUBIO_CLIENT_ID;
    const secretId = import.meta.env.VITE_XUBIO_SECRET_ID;
    const tokenUrl = `${import.meta.env.VITE_XUBIO_BASE_URL}/TokenEndpoint`;
    console.log("Requesting access token from:", tokenUrl); 

    const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(`${clientId}:${secretId}`)
        },
        body: "grant_type=client_credentials"
    });

    if (!response.ok) {
        throw new Error(`Error obteniendo token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
}