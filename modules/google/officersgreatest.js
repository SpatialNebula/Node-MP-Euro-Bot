const officersgreatest = {}

officersgreatest.submitForm = async (robloxName, proof, submissionType) => {
    const form_response = await fetch(
        "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdxBtv6gP7Gc-VP2zIFGNIU-V35vid3SBlnvOeqcMpcnKhABw/formResponse",
        {
            method: "POST",
            headers: new Headers([
                ["Content-Type", "application/x-www-form-urlencoded"],
            ]),
            body: `entry.1063261469=${robloxName}&entry.537377005=${proof}&entry.780508841=${submissionType}`,
        }
    );

    if (!form_response.ok) {
        throw new Error(`OG submission failed with error: \`${form_response.statusText}\``)
    }
}

module.exports = officersgreatest