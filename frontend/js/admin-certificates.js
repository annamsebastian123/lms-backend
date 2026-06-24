

document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("adminCertificatesBody");

    try {
        const certificates = await apiRequest("/certificates/admin");
        const list = Array.isArray(certificates) ? certificates : [];

        if (list.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">No certificates issued yet.</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = "";

        list.forEach((cert) => {
            tableBody.innerHTML += `
                <tr>
                    <td>${cert.certificateNumber || "N/A"}</td>
                    <td>${cert.user?.name || cert.user?.email || "N/A"}</td>
                    <td>${cert.course?.title || "N/A"}</td>
                    <td>${cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : "N/A"}</td>
                    <td>
                       <a href="${API_BASE_URL}/certificates/${cert.id}/download" target="_blank">
    <button class="action-btn">Download</button>
</a>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Failed to load admin certificates", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">Failed to load certificates.</td>
            </tr>
        `;
    }
});