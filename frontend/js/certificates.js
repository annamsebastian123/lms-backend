const certificatesContainer = document.querySelector(".certificate-grid");

async function loadCertificates() {
    try {
        const token = localStorage.getItem("token");

const API_URL =
  window.location.origin.replace("-3000.", "-5000.") + "/api";

const response = await fetch(
    `${API_URL}/certificates/my-certificates`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const certificates = await response.json();

        certificatesContainer.innerHTML = "";

        if (certificates.length === 0) {
            certificatesContainer.innerHTML = `
                <p>No certificates earned yet.</p>
            `;
            return;
        }

        certificates.forEach(cert => {
            certificatesContainer.innerHTML += `
                <div class="certificate-card">

                    <div class="certificate-header" style="padding: 18px 20px; font-size: 16px; min-height: 60px; display: flex; align-items: center; justify-content: center;">
                        ${cert.course.title}
                    </div>

                    <div class="certificate-body">

                        <h4 style="margin: 0 0 12px 0; color: #4f46e5; font-size: 14px; font-weight: 700;">Certificate of Completion</h4>

                        <p>
                            Successfully completed the course.
                        </p>

                        <p>
                            Certificate ID:
                            ${cert.id}
                        </p>

                        <p>
                            Issued:
                            ${new Date(cert.issuedAt).toLocaleDateString()}
                        </p>
                        <div style="display: flex; gap: 12px; margin-top: 20px;">
                            <a href="${API_URL}/certificates/${cert.id}/download" target="_blank" style="flex: 1; text-decoration: none; margin: 0;">
                                <button class="btn" style="width: 100%; margin: 0; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                    View
                                </button>
                            </a>
                            <a href="${API_URL}/certificates/${cert.id}/download" download style="flex: 1; text-decoration: none; margin: 0;">
                                <button class="btn" style="background: #10b981; color: white; border: none; width: 100%; margin: 0; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                    Download
                                </button>
                            </a>
                        </div>

                    </div>

                </div>
            `;
        });

    } catch (error) {
        console.error("Failed to load certificates", error);

        certificatesContainer.innerHTML = `
            <p>Failed to load certificates.</p>
        `;
    }
}

loadCertificates();