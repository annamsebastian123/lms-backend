const certificatesContainer = document.querySelector(".certificate-grid");

async function loadCertificates() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:5000/api/certificates/my-certificates",
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

                    <div class="certificate-header">
                        Certificate of Completion
                    </div>

                    <div class="certificate-body">

                        <h2>${cert.course.title}</h2>

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

                        <button class="btn">
                            Download Certificate
                        </button>

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