const API_URL =
    `${import.meta.env.VITE_API_BASE_URL}/api`;

// =========================================================
// RESERVATIONS
// =========================================================

export async function getReservations() {
    const response = await fetch(`${API_URL}/Reservation`);

    if (!response.ok) {
        throw new Error("Failed to load reservations");
    }

    return await response.json();
}


// =========================================================
// GUEST
// =========================================================

export async function createGuest(guest) {
    const response = await fetch(`${API_URL}/Guest`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(guest)
    });

    if (!response.ok) {
        throw new Error("Failed to create guest");
    }

    return await response.json();
}


// =========================================================
// CREATE RESERVATION
// =========================================================

export async function createReservation(reservation) {
    const response = await fetch(
        `${API_URL}/Reservation`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reservation)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create reservation"
        );
    }

    return data;
}


// =========================================================
// PRE CHECK-IN
// =========================================================

export async function preCheckIn(id) {
    const response = await fetch(
        `${API_URL}/Reservation/${id}/pre-checkin`,
        {
            method: "PUT"
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to move reservation to PRE_CHECKIN"
        );
    }

    return await response.json();
}


// =========================================================
// CHECK-IN
// =========================================================

export async function checkIn(id) {
    const response = await fetch(
        `${API_URL}/Reservation/${id}/checkin`,
        {
            method: "PUT"
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to check in reservation"
        );
    }

    return await response.json();
}


// =========================================================
// CHECK-OUT
// =========================================================

export async function checkOut(id) {
    const response = await fetch(
        `${API_URL}/Reservation/${id}/checkout`,
        {
            method: "PUT"
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to check out reservation"
        );
    }

    return await response.json();
}


// =========================================================
// IDENTITY DOCUMENT UPLOAD
// =========================================================

export async function uploadIdentityDocument(
    reservationId,
    file,
    documentType
) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("documentType", documentType);

    const response = await fetch(
        `${API_URL}/IdentityDocument/upload/${reservationId}`,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to upload identity document"
        );
    }

    return data;
}


// =========================================================
// GET IDENTITY DOCUMENTS
// =========================================================

export async function getIdentityDocuments(
    reservationId
) {
    const response = await fetch(
        `${API_URL}/IdentityDocument/${reservationId}`
    );

    if (!response.ok) {
        throw new Error(
            "Failed to load identity documents"
        );
    }

    return await response.json();
}


// =========================================================
// PAYMENT
// =========================================================

export async function createPayment(
    reservationId,
    amount
) {
    const response = await fetch(
        `${API_URL}/Payment`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                reservationId: reservationId,
                amount: amount
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to create payment"
        );
    }

    return data;
}


// =========================================================
// GET PAYMENT BY RESERVATION
// =========================================================

export async function getPaymentByReservation(
    reservationId
) {
    const response = await fetch(
        `${API_URL}/Payment/reservation/${reservationId}`
    );

    // No payment created yet
    if (response.status === 404) {
        return null;
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to load payment"
        );
    }

    return data;
}


// =========================================================
// COMPLETE DEMO PAYMENT
// =========================================================

export async function completeDemoPayment(
    paymentId
) {
    const response = await fetch(
        `${API_URL}/Payment/${paymentId}/pay`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to complete payment"
        );
    }

    return data;
}