function generateEmailContent(prescriptions) {
    let htmlContent = '<html><body>';
    const pharmacyGroups = new Map();

    prescriptions.forEach(prescription => {
        const email = prescription.IssuerPharmacyEmail;
        if (!pharmacyGroups.has(email)) {
            pharmacyGroups.set(email, []);
        }
        pharmacyGroups.get(email).push(prescription);
    });

    pharmacyGroups.forEach((pharmacyPrescriptions, pharmacyEmail) => {
        htmlContent += `<h2>To: ${pharmacyEmail}</h2>`;
        htmlContent += `<p>You have ${pharmacyPrescriptions.length} incomplete prescriptions today</p>`;
        htmlContent += '<table border="1" style="border-collapse: collapse; width: 100%;">';
        htmlContent += '<tr><th>Prescription ID</th><th>Missing Medicines</th></tr>';

        pharmacyPrescriptions.forEach(prescription => {
            const missingMedicines = prescription.missingMedicines
                .map(medicine => medicine.name)
                .join(', ');

            // Notice here we use `_id`
            htmlContent += `
        <tr>
            <td style="padding: 8px;">${prescription._id}</td>
            <td style="padding: 8px;">${missingMedicines}</td>
        </tr>`;
        });


        htmlContent += '</table><br><br>';
    });

    htmlContent += '</body></html>';
    return htmlContent;
}

module.exports = generateEmailContent;
