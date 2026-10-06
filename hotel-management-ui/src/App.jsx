import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import {
  getReservations,
  createReservation,
  preCheckIn,
  checkIn,
  checkOut,
  uploadIdentityDocument,
  getIdentityDocuments,

  // Payment
  createPayment,
  getPaymentByReservation,
  completeDemoPayment,
} from "./services/reservationService";

const API_ROOT_URL =
  import.meta.env.VITE_API_BASE_URL;

const API_BASE_URL =
  `${API_ROOT_URL}/api`;

function App() {
  // =========================================================
  // RESERVATIONS
  // =========================================================

  const [reservations, setReservations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // =========================================================
  // FULL REPORT
  // =========================================================

  const [showReport, setShowReport] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportDocuments, setReportDocuments] = useState([]);
  const [reportPayments, setReportPayments] = useState({});

  // =========================================================
  // CREATE RESERVATION
  // =========================================================

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [roomNumber, setRoomNumber] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  // =========================================================
  // DOCUMENT UPLOAD
  // =========================================================

  const [showUploadModal, setShowUploadModal] = useState(false);

  const [selectedReservation, setSelectedReservation] =
    useState(null);

  const [documentType, setDocumentType] =
    useState("Passport");

  const [documentFile, setDocumentFile] =
    useState(null);

  const [uploadingDocument, setUploadingDocument] =
    useState(false);

  const [uploadedReservationIds, setUploadedReservationIds] =
    useState([]);

  // =========================================================
  // PAYMENT
  // =========================================================

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [paymentReservation, setPaymentReservation] =
    useState(null);

  const [payment, setPayment] = useState(null);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [loadingPayment, setLoadingPayment] =
    useState(false);

  const [processingPayment, setProcessingPayment] =
    useState(false);

  // =========================================================
  // ALERTS
  // =========================================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // CURRENT DATE/TIME
  // =========================================================

  const getCurrentDateTimeLocal = () => {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    const hour = String(
      now.getHours()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:00`;
  };

  // =========================================================
  // LOAD RESERVATIONS
  // =========================================================

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getReservations();

      setReservations(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Load reservations error:",
        err
      );

      setError(
        err.message ||
          "Unable to load reservations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  // =========================================================
  // DASHBOARD COUNTS
  // =========================================================

  const newCount =
    reservations.filter(
      (r) => r.status === "NEW"
    ).length;

  const preCheckInCount =
    reservations.filter(
      (r) => r.status === "PRE_CHECKIN"
    ).length;

  const checkedInCount =
    reservations.filter(
      (r) => r.status === "CHECKED_IN"
    ).length;

  const checkedOutCount =
    reservations.filter(
      (r) => r.status === "CHECKED_OUT"
    ).length;

  // =========================================================
  // ACTIVE RESERVATIONS
  // =========================================================

  const activeReservations = useMemo(() => {
    return reservations.filter(
      (reservation) =>
        reservation.status !==
        "CHECKED_OUT"
    );
  }, [reservations]);

  // =========================================================
  // DATE VALIDATION
  // =========================================================

  const validateDates = () => {
    if (!checkInDate) {
      return "Please select check-in date and hour.";
    }

    if (!checkOutDate) {
      return "Please select check-out date and hour.";
    }

    const now = new Date();

    const checkIn = new Date(
      checkInDate
    );

    const checkOut = new Date(
      checkOutDate
    );

    if (checkIn < now) {
      return "Check-in date and time cannot be in the past.";
    }

    if (checkOut < now) {
      return "Check-out date and time cannot be in the past.";
    }

    if (checkOut <= checkIn) {
      return "Check-out must be after check-in.";
    }

    return "";
  };

  // =========================================================
  // ROOM AVAILABILITY
  // =========================================================

  const isRoomAvailable = () => {
    const requestedCheckIn =
      new Date(checkInDate);

    const requestedCheckOut =
      new Date(checkOutDate);

    const requestedRoom =
      roomNumber
        .trim()
        .toLowerCase();

    const conflictingReservation =
      reservations.find(
        (reservation) => {
          const existingRoom =
            String(
              reservation.roomNumber ||
                ""
            )
              .trim()
              .toLowerCase();

          if (
            existingRoom !==
            requestedRoom
          ) {
            return false;
          }

          if (
            reservation.status ===
            "CHECKED_OUT"
          ) {
            return false;
          }

          const existingCheckIn =
            new Date(
              reservation.checkInDate
            );

          const existingCheckOut =
            new Date(
              reservation.checkOutDate
            );

          return (
            requestedCheckIn <
              existingCheckOut &&
            requestedCheckOut >
              existingCheckIn
          );
        }
      );

    return !conflictingReservation;
  };

  // =========================================================
  // CREATE RESERVATION
  // =========================================================

  const handleCreateReservation =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (!firstName.trim()) {
        setError(
          "First name is required."
        );
        return;
      }

      if (!lastName.trim()) {
        setError(
          "Last name is required."
        );
        return;
      }

      if (!email.trim()) {
        setError(
          "Email is required."
        );
        return;
      }

      if (!phoneNumber.trim()) {
        setError(
          "Phone number is required."
        );
        return;
      }

      if (
        !/^\d{10}$/.test(
          phoneNumber
        )
      ) {
        setError(
          "Phone number must contain exactly 10 digits."
        );
        return;
      }

      if (!roomNumber.trim()) {
        setError(
          "Room number is required."
        );
        return;
      }

      const dateError =
        validateDates();

      if (dateError) {
        setError(dateError);
        return;
      }

      if (!isRoomAvailable()) {
        setError(
          `Room ${roomNumber} is already reserved for the selected date/time.`
        );
        return;
      }

      try {
        setCreating(true);

        // -----------------------------------------------------
        // CREATE GUEST
        // -----------------------------------------------------

        const guestResponse =
          await fetch(
            `${API_BASE_URL}/Guest`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                firstName:
                  firstName.trim(),

                lastName:
                  lastName.trim(),

                email:
                  email.trim(),

                phoneNumber:
                  phoneNumber.trim(),
              }),
            }
          );

        if (!guestResponse.ok) {
          throw new Error(
            "Failed to create guest."
          );
        }

        const guest =
          await guestResponse.json();

        // -----------------------------------------------------
        // CREATE RESERVATION
        // -----------------------------------------------------

        const reservation = {
          guestId: guest.id,

          roomNumber:
            roomNumber.trim(),

          checkInDate,

          checkOutDate,
        };

        await createReservation(
          reservation
        );

        setSuccess(
          "Reservation created successfully."
        );

        // Reset form

        setFirstName("");
        setLastName("");
        setEmail("");
        setPhoneNumber("");
        setRoomNumber("");
        setCheckInDate("");
        setCheckOutDate("");

        await loadReservations();
      } catch (err) {
        console.error(
          "Create reservation error:",
          err
        );

        setError(
          err.message ||
            "Failed to create reservation."
        );
      } finally {
        setCreating(false);
      }
    };

  // =========================================================
  // OPEN UPLOAD MODAL
  // =========================================================

  const handleOpenUploadModal =
    (reservation) => {
      setSelectedReservation(
        reservation
      );

      setDocumentType("Passport");
      setDocumentFile(null);

      setError("");
      setSuccess("");

      setShowUploadModal(true);
    };

  // =========================================================
  // CLOSE UPLOAD MODAL
  // =========================================================

  const handleCloseUploadModal = () => {
    if (uploadingDocument) {
      return;
    }

    setShowUploadModal(false);

    setSelectedReservation(null);

    setDocumentFile(null);

    setDocumentType("Passport");
  };

  // =========================================================
  // UPLOAD ID DOCUMENT
  // =========================================================

  const handleUploadDocument =
    async () => {
      if (!selectedReservation) {
        setError(
          "Please select a reservation."
        );
        return;
      }

      if (!documentFile) {
        setError(
          "Please select an identity document."
        );
        return;
      }

      if (!documentType) {
        setError(
          "Please select document type."
        );
        return;
      }

      // File size

      if (
        documentFile.size >
        5 * 1024 * 1024
      ) {
        setError(
          "File size cannot exceed 5 MB."
        );
        return;
      }

      // File type

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
      ];

      if (
        !allowedTypes.includes(
          documentFile.type
        )
      ) {
        setError(
          "Only JPG, JPEG, PNG and PDF files are allowed."
        );
        return;
      }

      try {
        setUploadingDocument(true);

        setError("");
        setSuccess("");

        await uploadIdentityDocument(
          selectedReservation.id,
          documentFile,
          documentType
        );

        setUploadedReservationIds(
          (previous) => {
            if (
              previous.includes(
                selectedReservation.id
              )
            ) {
              return previous;
            }

            return [
              ...previous,
              selectedReservation.id,
            ];
          }
        );

        setSuccess(
          "Identity document uploaded successfully. You can now check in the guest."
        );

        setDocumentFile(null);

        setShowUploadModal(false);

        setSelectedReservation(null);

        await loadReservations();
      } catch (err) {
        console.error(
          "Document upload error:",
          err
        );

        setError(
          err.message ||
            "Failed to upload identity document."
        );
      } finally {
        setUploadingDocument(false);
      }
    };

  // =========================================================
  // CHECK DOCUMENT
  // =========================================================

  const hasUploadedDocument =
    (reservation) => {
      return uploadedReservationIds.includes(
        reservation.id
      );
    };

  // =========================================================
  // PRE CHECK-IN
  // =========================================================

  const handlePreCheckIn =
    async (id) => {
      try {
        setError("");
        setSuccess("");

        await preCheckIn(id);

        setSuccess(
          "Reservation moved to PRE CHECK-IN."
        );

        await loadReservations();
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Failed to move reservation to pre-check-in."
        );
      }
    };

  // =========================================================
  // CHECK-IN
  // =========================================================

  const handleCheckIn =
    async (reservation) => {
      try {
        setError("");
        setSuccess("");

        if (
          !hasUploadedDocument(
            reservation
          )
        ) {
          const documents =
            await getIdentityDocuments(
              reservation.id
            );

          if (
            !Array.isArray(
              documents
            ) ||
            documents.length === 0
          ) {
            setError(
              "Please upload an identity document before check-in."
            );

            return;
          }

          setUploadedReservationIds(
            (previous) => [
              ...new Set([
                ...previous,
                reservation.id,
              ]),
            ]
          );
        }

        await checkIn(
          reservation.id
        );

        setSuccess(
          "Guest checked in successfully."
        );

        await loadReservations();
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Failed to check in guest."
        );
      }
    };

  // =========================================================
  // OPEN PAYMENT
  // =========================================================

  const handleOpenPayment =
    async (reservation) => {
      try {
        setError("");
        setSuccess("");

        setPaymentReservation(
          reservation
        );

        setPayment(null);

        setPaymentAmount("");

        setLoadingPayment(true);

        setShowPaymentModal(true);

        // -----------------------------------------------
        // FIND EXISTING PAYMENT
        // -----------------------------------------------

        let existingPayment = null;

        try {
          existingPayment =
            await getPaymentByReservation(
              reservation.id
            );
        } catch (err) {
          console.log(
            "No existing payment found. Creating new payment."
          );

          existingPayment = null;
        }

        // -----------------------------------------------
        // EXISTING PAYMENT
        // -----------------------------------------------

        if (existingPayment) {
          setPayment(
            existingPayment
          );

          setPaymentAmount(
            existingPayment.amount ??
              ""
          );

          return;
        }

        // -----------------------------------------------
        // CREATE PAYMENT
        // -----------------------------------------------

        const newPayment =
          await createPayment(
            reservation.id,
            1000
          );

        setPayment(
          newPayment
        );

        setPaymentAmount(
          newPayment.amount ??
            1000
        );
      } catch (err) {
        console.error(
          "Payment error:",
          err
        );

        setError(
          err.message ||
            "Failed to create payment."
        );

        setShowPaymentModal(false);
      } finally {
        setLoadingPayment(false);
      }
    };

  // =========================================================
  // CLOSE PAYMENT MODAL
  // =========================================================

  const handleClosePayment =
    () => {
      if (processingPayment) {
        return;
      }

      setShowPaymentModal(false);

      setPaymentReservation(null);

      setPayment(null);

      setPaymentAmount("");
    };

  // =========================================================
  // COMPLETE DEMO PAYMENT
  // =========================================================

  const handleDemoPayment =
    async () => {
      if (
        !paymentReservation ||
        !payment
      ) {
        setError(
          "Payment information is not available."
        );
        return;
      }

      if (!payment.id) {
        setError(
          "Payment ID is missing."
        );
        return;
      }

      try {
        setProcessingPayment(true);

        setError("");
        setSuccess("");

        // -----------------------------------------------
        // COMPLETE PAYMENT
        // -----------------------------------------------

        const result =
          await completeDemoPayment(
            payment.id
          );

        setPayment(result);

        // -----------------------------------------------
        // CHECK OUT AFTER PAYMENT
        // -----------------------------------------------

        await checkOut(
          paymentReservation.id
        );

        setSuccess(
          "Payment completed successfully and guest checked out."
        );

        setShowPaymentModal(false);

        setPaymentReservation(
          null
        );

        setPayment(null);

        setPaymentAmount("");

        await loadReservations();
      } catch (err) {
        console.error(
          "Demo payment error:",
          err
        );

        setError(
          err.message ||
            "Failed to complete payment."
        );
      } finally {
        setProcessingPayment(false);
      }
    };

  // =========================================================
  // GET PAYMENT FOR REPORT
  // =========================================================

  const getPaymentAmountForReport =
    (reservationId) => {
      const payment =
        reportPayments[
          reservationId
        ];

      if (!payment) {
        return "-";
      }

      if (
        payment.amount === null ||
        payment.amount === undefined
      ) {
        return "-";
      }

      return `₹${Number(
        payment.amount
      ).toFixed(2)}`;
    };

  // =========================================================
  // VIEW FULL REPORT
  // =========================================================

  const handleViewReport =
    async () => {
      try {
        setLoadingReport(true);

        setError("");

        // -----------------------------------------------------
        // LOAD DOCUMENTS
        // -----------------------------------------------------

        const allDocuments = [];

        for (
          const reservation of reservations
        ) {
          try {
            const docs =
              await getIdentityDocuments(
                reservation.id
              );

            if (
              Array.isArray(docs)
            ) {
              docs.forEach(
                (doc) => {
                  allDocuments.push({
                    ...doc,

                    reservationId:
                      reservation.id,

                    guestName:
                      reservation.guest
                        ? `${reservation.guest.firstName} ${reservation.guest.lastName}`
                        : `Guest #${reservation.guestId}`,

                    guestEmail:
                      reservation.guest
                        ?.email ||
                      "-",

                    roomNumber:
                      reservation.roomNumber,

                    checkInDate:
                      reservation.checkInDate,

                    checkOutDate:
                      reservation.checkOutDate,

                    reservationStatus:
                      reservation.status,
                  });
                }
              );
            }
          } catch (err) {
            console.error(
              `Failed to load documents for reservation ${reservation.id}`,
              err
            );
          }
        }

        setReportDocuments(
          allDocuments
        );

        // -----------------------------------------------------
        // LOAD PAYMENTS
        // -----------------------------------------------------

        const payments = {};

        await Promise.all(
          reservations.map(
            async (reservation) => {
              try {
                const payment =
                  await getPaymentByReservation(
                    reservation.id
                  );

                if (payment) {
                  payments[
                    reservation.id
                  ] = payment;
                }
              } catch (err) {
                // No payment is normal for NEW/PRE_CHECKIN
                console.log(
                  `No payment for reservation ${reservation.id}`
                );
              }
            }
          )
        );

        setReportPayments(
          payments
        );

        setShowReport(true);
      } catch (err) {
        console.error(err);

        setError(
          "Failed to load report."
        );
      } finally {
        setLoadingReport(false);
      }
    };

  // =========================================================
  // CLOSE REPORT
  // =========================================================

  const handleCloseReport = () => {
    setShowReport(false);

    setReportDocuments([]);

    setReportPayments({});
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    const value =
      new Date(date);

    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return date;
    }

    return value.toLocaleString(
      "en-IN",
      {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusBadge =
    (status) => {
      switch (status) {
        case "NEW":
          return (
            <span className="badge rounded-pill bg-primary px-3 py-2">
              NEW
            </span>
          );

        case "PRE_CHECKIN":
          return (
            <span className="badge rounded-pill bg-warning text-dark px-3 py-2">
              PRE CHECK-IN
            </span>
          );

        case "CHECKED_IN":
          return (
            <span className="badge rounded-pill bg-success px-3 py-2">
              CHECKED IN
            </span>
          );

        case "CHECKED_OUT":
          return (
            <span className="badge rounded-pill bg-secondary px-3 py-2">
              CHECKED OUT
            </span>
          );

        default:
          return (
            <span className="badge rounded-pill bg-dark px-3 py-2">
              {status}
            </span>
          );
      }
    };

  // =========================================================
  // DOCUMENT URL
  // =========================================================
  //
  // Your API currently returns:
  //
  // C:\Users\Lenovo\HotelManagement\
  // HotelManagement.Api\Uploads\
  // IdentityDocuments\
  // 9e93e7f5-5060-4d1c-a8a7-0825d67f5f8e.jpg
  //
  // We convert that to:
  //
  // http://localhost:5210/uploads/IdentityDocuments/
  // 9e93e7f5f-5060-4d1c-a8a7-0825d67f5f8e.jpg
  //
  // =========================================================

  const getDocumentUrl =
    (document) => {
      if (!document) {
        return null;
      }

      // -----------------------------------------------------
      // If API already gives a URL
      // -----------------------------------------------------

      if (
        document.filePath &&
        (
          document.filePath.startsWith(
            "http://"
          ) ||
          document.filePath.startsWith(
            "https://"
          )
        )
      ) {
        return document.filePath;
      }

      // -----------------------------------------------------
      // Get physical filename from filePath
      // -----------------------------------------------------

      if (document.filePath) {
        const normalizedPath =
          document.filePath.replace(
            /\\/g,
            "/"
          );

        const pathParts =
          normalizedPath.split(
            "/"
          );

        const physicalFileName =
          pathParts[
            pathParts.length - 1
          ];

        if (physicalFileName) {
          return `${API_ROOT_URL}/uploads/IdentityDocuments/${encodeURIComponent(
            physicalFileName
          )}`;
        }
      }

      return null;
    };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="min-vh-100"
      style={{
        background:
          "linear-gradient(135deg, #f5f7fb 0%, #eef2f7 100%)",
      }}
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <nav
        className="navbar navbar-dark shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, #172554 0%, #1e3a8a 100%)",
        }}
      >
        <div className="container-fluid px-4 py-2">

          <div className="d-flex align-items-center">

            <div
              className="rounded-3 d-flex align-items-center justify-content-center me-3"
              style={{
                width: "45px",
                height: "45px",
                background:
                  "rgba(255,255,255,0.15)",
                fontSize: "24px",
              }}
            >
              🏨
            </div>

            <div>

              <div className="text-white fw-bold fs-5">
                Hotel Management
              </div>

              <small className="text-white-50">
                Reservation & Guest Management
              </small>

            </div>

          </div>

          <div className="text-white">

            <span className="badge bg-light text-primary px-3 py-2">
              ADMIN PANEL
            </span>

          </div>

        </div>
      </nav>

      <div className="container-fluid px-4 py-4">

        {/* =====================================================
            ALERTS
        ====================================================== */}

        {success && (
          <div
            className="alert alert-success border-0 shadow-sm d-flex align-items-center"
            role="alert"
          >

            <span className="fs-5 me-2">
              ✓
            </span>

            <div className="flex-grow-1">

              <strong>
                Success:
              </strong>{" "}

              {success}

            </div>

            <button
              type="button"
              className="btn-close"
              onClick={() =>
                setSuccess("")
              }
            />

          </div>
        )}

        {error && (
          <div
            className="alert alert-danger border-0 shadow-sm d-flex align-items-center"
            role="alert"
          >

            <span className="fs-5 me-2">
              !
            </span>

            <div className="flex-grow-1">

              <strong>
                Error:
              </strong>{" "}

              {error}

            </div>

            <button
              type="button"
              className="btn-close"
              onClick={() =>
                setError("")
              }
            />

          </div>
        )}

        {/* =====================================================
            TITLE
        ====================================================== */}

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">

          <div>

            <h2 className="fw-bold mb-1 text-dark">
              Dashboard
            </h2>

            <p className="text-muted mb-0">
              Manage reservations, check-ins and guest documents.
            </p>

          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg shadow-sm mt-3 mt-md-0 px-4"
            onClick={
              handleViewReport
            }
            disabled={
              loadingReport
            }
            style={{
              background:
                "linear-gradient(135deg, #2563eb, #4f46e5)",
              border: "none",
            }}
          >

            {loadingReport ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                />

                Loading Report...
              </>
            ) : (
              <>
                <span className="me-2">
                  📊
                </span>

                View Full Report
              </>
            )}

          </button>

        </div>

        {/* =====================================================
            DASHBOARD CARDS
        ====================================================== */}

        <div className="row g-4 mb-4">

          {/* NEW */}

          <div className="col-12 col-sm-6 col-xl-3">

            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "16px",
                borderLeft:
                  "5px solid #2563eb",
              }}
            >

              <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <div className="text-muted fw-semibold mb-2">
                      NEW
                    </div>

                    <div
                      className="fw-bold text-primary"
                      style={{
                        fontSize: "42px",
                        lineHeight: "1",
                      }}
                    >
                      {newCount}
                    </div>

                    <small className="text-muted">
                      New reservations
                    </small>

                  </div>

                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "58px",
                      height: "58px",
                      background:
                        "#dbeafe",
                      fontSize: "25px",
                    }}
                  >
                    📅
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* PRE CHECK-IN */}

          <div className="col-12 col-sm-6 col-xl-3">

            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "16px",
                borderLeft:
                  "5px solid #f59e0b",
              }}
            >

              <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <div className="text-muted fw-semibold mb-2">
                      PRE CHECK-IN
                    </div>

                    <div
                      className="fw-bold text-warning"
                      style={{
                        fontSize: "42px",
                        lineHeight: "1",
                      }}
                    >
                      {preCheckInCount}
                    </div>

                    <small className="text-muted">
                      Awaiting check-in
                    </small>

                  </div>

                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "58px",
                      height: "58px",
                      background:
                        "#fef3c7",
                      fontSize: "25px",
                    }}
                  >
                    📄
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* CHECKED IN */}

          <div className="col-12 col-sm-6 col-xl-3">

            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "16px",
                borderLeft:
                  "5px solid #16a34a",
              }}
            >

              <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <div className="text-muted fw-semibold mb-2">
                      CHECKED IN
                    </div>

                    <div
                      className="fw-bold text-success"
                      style={{
                        fontSize: "42px",
                        lineHeight: "1",
                      }}
                    >
                      {checkedInCount}
                    </div>

                    <small className="text-muted">
                      Guests staying
                    </small>

                  </div>

                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "58px",
                      height: "58px",
                      background:
                        "#dcfce7",
                      fontSize: "25px",
                    }}
                  >
                    ✓
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* CHECKED OUT */}

          <div className="col-12 col-sm-6 col-xl-3">

            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "16px",
                borderLeft:
                  "5px solid #64748b",
              }}
            >

              <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <div className="text-muted fw-semibold mb-2">
                      CHECKED OUT
                    </div>

                    <div
                      className="fw-bold text-secondary"
                      style={{
                        fontSize: "42px",
                        lineHeight: "1",
                      }}
                    >
                      {checkedOutCount}
                    </div>

                    <small className="text-muted">
                      Completed stays
                    </small>

                  </div>

                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "58px",
                      height: "58px",
                      background:
                        "#f1f5f9",
                      fontSize: "25px",
                    }}
                  >
                    ✓
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            CREATE RESERVATION
        ====================================================== */}

        <div
          className="card border-0 shadow-sm mb-4"
          style={{
            borderRadius: "16px",
          }}
        >

          <div
            className="card-header text-white border-0 py-3"
            style={{
              borderRadius:
                "16px 16px 0 0",
              background:
                "linear-gradient(135deg, #1e3a8a, #2563eb)",
            }}
          >

            <h5 className="mb-0 fw-bold">

              <span className="me-2">
                +
              </span>

              Create New Reservation

            </h5>

          </div>

          <div className="card-body p-4">

            <form
              onSubmit={
                handleCreateReservation
              }
            >

              <div className="row g-3">

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    First Name
                  </label>

                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(
                        e.target.value
                      )
                    }
                    placeholder="Enter first name"
                  />

                </div>

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Last Name
                  </label>

                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={lastName}
                    onChange={(e) =>
                      setLastName(
                        e.target.value
                      )
                    }
                    placeholder="Enter last name"
                  />

                </div>

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Email
                  </label>

                  <input
                    type="email"
                    className="form-control form-control-lg"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="guest@example.com"
                  />

                </div>

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={phoneNumber}
                    maxLength="10"
                    inputMode="numeric"
                    placeholder="10 digit phone number"
                    onChange={(e) => {
                      const value =
                        e.target.value.replace(
                          /\D/g,
                          ""
                        );

                      setPhoneNumber(
                        value
                      );
                    }}
                  />

                </div>

                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    Room Number
                  </label>

                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={roomNumber}
                    onChange={(e) =>
                      setRoomNumber(
                        e.target.value
                      )
                    }
                    placeholder="Example: 101"
                  />

                </div>

                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    Check-in Date & Hour
                  </label>

                  <input
                    type="datetime-local"
                    className="form-control form-control-lg"
                    value={checkInDate}
                    min={
                      getCurrentDateTimeLocal()
                    }
                    step="3600"
                    onChange={(e) => {
                      setCheckInDate(
                        e.target.value
                      );

                      if (
                        checkOutDate &&
                        new Date(
                          e.target.value
                        ) >=
                          new Date(
                            checkOutDate
                          )
                      ) {
                        setCheckOutDate("");
                      }
                    }}
                  />

                </div>

                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    Check-out Date & Hour
                  </label>

                  <input
                    type="datetime-local"
                    className="form-control form-control-lg"
                    value={checkOutDate}
                    min={
                      checkInDate ||
                      getCurrentDateTimeLocal()
                    }
                    step="3600"
                    onChange={(e) =>
                      setCheckOutDate(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="col-12 mt-4">

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-4"
                    disabled={creating}
                    style={{
                      background:
                        "linear-gradient(135deg, #2563eb, #4f46e5)",
                      border: "none",
                    }}
                  >

                    {creating ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                        />

                        Creating...
                      </>
                    ) : (
                      <>
                        <span className="me-2">
                          +
                        </span>

                        Create Reservation
                      </>
                    )}

                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

        {/* =====================================================
            ACTIVE RESERVATIONS
        ====================================================== */}

        <div
          className="card border-0 shadow-sm"
          style={{
            borderRadius: "16px",
          }}
        >

          <div className="card-header bg-white border-0 p-4">

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">

              <div>

                <h5 className="fw-bold mb-1">
                  Active Reservations
                </h5>

                <small className="text-muted">
                  Checked-out reservations are available in the full report.
                </small>

              </div>

              <button
                className="btn btn-outline-primary mt-3 mt-md-0"
                onClick={
                  loadReservations
                }
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    ↻ Refresh
                  </>
                )}

              </button>

            </div>

          </div>

          <div className="card-body p-0">

            {loading ? (

              <div className="text-center py-5">

                <div
                  className="spinner-border text-primary"
                  role="status"
                />

                <p className="mt-3 text-muted">
                  Loading reservations...
                </p>

              </div>

            ) : activeReservations.length === 0 ? (

              <div className="text-center py-5">

                <div
                  style={{
                    fontSize: "45px",
                  }}
                >
                  🏨
                </div>

                <h5 className="mt-3">
                  No active reservations
                </h5>

                <p className="text-muted mb-0">
                  New reservations will appear here.
                </p>

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                  <thead
                    style={{
                      background:
                        "#f8fafc",
                    }}
                  >

                    <tr>

                      <th className="px-4 py-3">
                        ID
                      </th>

                      <th className="py-3">
                        Guest
                      </th>

                      <th className="py-3">
                        Email
                      </th>

                      <th className="py-3">
                        Room
                      </th>

                      <th className="py-3">
                        Check-in
                      </th>

                      <th className="py-3">
                        Check-out
                      </th>

                      <th className="py-3">
                        Status
                      </th>

                      <th className="py-3 text-center">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {activeReservations.map(
                      (reservation) => (

                        <tr
                          key={
                            reservation.id
                          }
                        >

                          <td className="px-4 fw-bold text-primary">
                            #
                            {
                              reservation.id
                            }
                          </td>

                          <td>

                            <div className="fw-semibold">
                              {reservation.guest
                                ? `${reservation.guest.firstName} ${reservation.guest.lastName}`
                                : `Guest #${reservation.guestId}`}
                            </div>

                          </td>

                          <td className="text-muted">
                            {reservation.guest
                              ?.email || "-"}
                          </td>

                          <td>

                            <span className="badge bg-light text-dark border px-3 py-2">
                              Room{" "}
                              {
                                reservation.roomNumber
                              }
                            </span>

                          </td>

                          <td className="text-muted small">
                            {formatDate(
                              reservation.checkInDate
                            )}
                          </td>

                          <td className="text-muted small">
                            {formatDate(
                              reservation.checkOutDate
                            )}
                          </td>

                          <td>
                            {getStatusBadge(
                              reservation.status
                            )}
                          </td>

                          <td>

                            <div className="d-flex justify-content-center gap-2 flex-wrap">

                              {/* NEW */}

                              {reservation.status ===
                                "NEW" && (

                                <button
                                  type="button"
                                  className="btn btn-sm btn-warning px-3"
                                  onClick={() =>
                                    handlePreCheckIn(
                                      reservation.id
                                    )
                                  }
                                >
                                  Pre Check-In
                                </button>

                              )}

                              {/* PRE CHECK-IN */}

                              {reservation.status ===
                                "PRE_CHECKIN" && (
                                <>

                                  {!hasUploadedDocument(
                                    reservation
                                  ) && (

                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary px-3"
                                      onClick={() =>
                                        handleOpenUploadModal(
                                          reservation
                                        )
                                      }
                                    >
                                      📄 Upload ID
                                    </button>

                                  )}

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-success px-3"
                                    onClick={() =>
                                      handleCheckIn(
                                        reservation
                                      )
                                    }
                                  >
                                    ✓ Check In
                                  </button>

                                </>
                              )}

                              {/* CHECKED IN */}

                              {reservation.status ===
                                "CHECKED_IN" && (

                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary px-3"
                                  onClick={() =>
                                    handleOpenPayment(
                                      reservation
                                    )
                                  }
                                >
                                  💳 Payment
                                </button>

                              )}

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

        {/* =====================================================
            FULL REPORT
        ====================================================== */}

        {showReport && (

          <div
            className="card border-0 shadow-sm mt-4"
            style={{
              borderRadius: "16px",
            }}
          >

            <div
              className="card-header text-white p-4"
              style={{
                borderRadius:
                  "16px 16px 0 0",
                background:
                  "linear-gradient(135deg, #172554, #312e81)",
              }}
            >

              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">

                <div>

                  <h4 className="fw-bold mb-1">
                    📊 Complete Check-In Report
                  </h4>

                  <small className="text-white-50">
                    Reservation history, identity documents and payment details
                  </small>

                </div>

                <button
                  type="button"
                  className="btn btn-light mt-3 mt-md-0 px-4"
                  onClick={
                    handleCloseReport
                  }
                >
                  ✕ Close Report
                </button>

              </div>

            </div>

            <div className="card-body p-4">

              {/* =================================================
                  REPORT SUMMARY
              ================================================== */}

              <div className="row g-3 mb-4">

                <div className="col-md-4">

                  <div className="bg-light rounded-3 p-3">

                    <small className="text-muted">
                      Total Reservations
                    </small>

                    <div className="fs-3 fw-bold text-primary">
                      {
                        reservations.length
                      }
                    </div>

                  </div>

                </div>

                <div className="col-md-4">

                  <div className="bg-light rounded-3 p-3">

                    <small className="text-muted">
                      Checked In
                    </small>

                    <div className="fs-3 fw-bold text-success">
                      {
                        checkedInCount
                      }
                    </div>

                  </div>

                </div>

                <div className="col-md-4">

                  <div className="bg-light rounded-3 p-3">

                    <small className="text-muted">
                      Checked Out
                    </small>

                    <div className="fs-3 fw-bold text-secondary">
                      {
                        checkedOutCount
                      }
                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  REPORT TABLE
              ================================================== */}

              <div className="table-responsive">

                <table
                  className="table table-hover table-bordered align-middle mb-0"
                  style={{
                    minWidth:
                      "1500px",
                  }}
                >

                  <thead className="table-dark">

                    <tr>

                      <th>
                        Reservation
                      </th>

                      <th>
                        Guest
                      </th>

                      <th>
                        Email
                      </th>

                      <th>
                        Room
                      </th>

                      <th>
                        Check-in
                      </th>

                      <th>
                        Check-out
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Document Type
                      </th>

                      <th>
                        Payment Status
                      </th>

                      <th>
                        Paid Amount
                      </th>

                      <th className="text-center">
                        Document
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {reservations.map(
                      (reservation) => {

                        const documentsForReservation =
                          reportDocuments.filter(
                            (doc) =>
                              doc.reservationId ===
                              reservation.id
                          );

                        const paymentForReservation =
                          reportPayments[
                            reservation.id
                          ];

                        // =================================================
                        // RESERVATION HAS DOCUMENTS
                        // =================================================

                        if (
                          documentsForReservation.length >
                          0
                        ) {

                          return documentsForReservation.map(
                            (doc) => {

                              const documentUrl =
                                getDocumentUrl(
                                  doc
                                );

                              return (
                                <tr
                                  key={`${reservation.id}-${doc.id}`}
                                >

                                  <td className="fw-bold text-primary">
                                    #
                                    {
                                      reservation.id
                                    }
                                  </td>

                                  <td className="fw-semibold">
                                    {
                                      doc.guestName
                                    }
                                  </td>

                                  <td>
                                    {
                                      doc.guestEmail
                                    }
                                  </td>

                                  <td>

                                    <span className="badge bg-light text-dark border">
                                      {
                                        reservation.roomNumber
                                      }
                                    </span>

                                  </td>

                                  <td className="small">
                                    {formatDate(
                                      reservation.checkInDate
                                    )}
                                  </td>

                                  <td className="small">
                                    {formatDate(
                                      reservation.checkOutDate
                                    )}
                                  </td>

                                  <td>
                                    {getStatusBadge(
                                      reservation.status
                                    )}
                                  </td>

                                  <td>

                                    <span className="badge bg-info text-dark">
                                      {
                                        doc.documentType ||
                                        "-"
                                      }
                                    </span>

                                  </td>

                                  {/* PAYMENT STATUS */}

                                  <td>

                                    {paymentForReservation ? (

                                      paymentForReservation.status ===
                                      "PAID" ? (

                                        <span className="badge bg-success">
                                          PAID
                                        </span>

                                      ) : (

                                        <span className="badge bg-warning text-dark">
                                          {
                                            paymentForReservation.status ||
                                            "PENDING"
                                          }
                                        </span>

                                      )

                                    ) : (

                                      <span className="text-muted">
                                        -
                                      </span>

                                    )}

                                  </td>

                                  {/* PAID AMOUNT */}

                                  <td className="fw-bold text-success">

                                    {paymentForReservation &&
                                    paymentForReservation.status ===
                                      "PAID"
                                      ? `₹${Number(
                                          paymentForReservation.amount ||
                                            0
                                        ).toFixed(2)}`
                                      : "-"}

                                  </td>

                                  {/* DOCUMENT */}

                                  <td className="text-center">

                                    {documentUrl ? (

                                      <a
                                        href={
                                          documentUrl
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary"
                                      >
                                        👁 View
                                      </a>

                                    ) : (

                                      <span className="text-danger small">
                                        File unavailable
                                      </span>

                                    )}

                                  </td>

                                </tr>
                              );
                            }
                          );
                        }

                        // =================================================
                        // RESERVATION HAS NO DOCUMENT
                        // =================================================

                        return (
                          <tr
                            key={
                              reservation.id
                            }
                          >

                            <td className="fw-bold text-primary">
                              #
                              {
                                reservation.id
                              }
                            </td>

                            <td className="fw-semibold">

                              {reservation.guest
                                ? `${reservation.guest.firstName} ${reservation.guest.lastName}`
                                : `Guest #${reservation.guestId}`}

                            </td>

                            <td>
                              {
                                reservation
                                  .guest
                                  ?.email ||
                                "-"
                              }
                            </td>

                            <td>

                              <span className="badge bg-light text-dark border">
                                {
                                  reservation.roomNumber
                                }
                              </span>

                            </td>

                            <td className="small">
                              {formatDate(
                                reservation.checkInDate
                              )}
                            </td>

                            <td className="small">
                              {formatDate(
                                reservation.checkOutDate
                              )}
                            </td>

                            <td>
                              {getStatusBadge(
                                reservation.status
                              )}
                            </td>

                            <td>
                              <span className="text-muted">
                                No document
                              </span>
                            </td>

                            {/* PAYMENT STATUS */}

                            <td>

                              {paymentForReservation ? (

                                paymentForReservation.status ===
                                "PAID" ? (

                                  <span className="badge bg-success">
                                    PAID
                                  </span>

                                ) : (

                                  <span className="badge bg-warning text-dark">
                                    {
                                      paymentForReservation.status ||
                                      "PENDING"
                                    }
                                  </span>

                                )

                              ) : (

                                <span className="text-muted">
                                  -
                                </span>

                              )}

                            </td>

                            {/* PAID AMOUNT */}

                            <td className="fw-bold text-success">

                              {paymentForReservation &&
                              paymentForReservation.status ===
                                "PAID"
                                ? `₹${Number(
                                    paymentForReservation.amount ||
                                      0
                                  ).toFixed(2)}`
                                : "-"}

                            </td>

                            <td className="text-center">

                              <span className="text-muted">
                                -
                              </span>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}

      </div>

      {/* =====================================================
          UPLOAD ID MODAL
      ====================================================== */}

      {showUploadModal &&
        selectedReservation && (

          <>

            <div
              className="modal-backdrop fade show"
              style={{
                zIndex: 1040,
              }}
            />

            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              style={{
                zIndex: 1050,
              }}
            >

              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >

                <div
                  className="modal-content border-0 shadow-lg"
                  style={{
                    borderRadius:
                      "18px",
                  }}
                >

                  <div
                    className="modal-header text-white border-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #1e3a8a, #2563eb)",
                      borderRadius:
                        "18px 18px 0 0",
                    }}
                  >

                    <div>

                      <h5 className="modal-title fw-bold">
                        📄 Upload Identity Document
                      </h5>

                      <small className="text-white-50">
                        Verify guest identity before check-in
                      </small>

                    </div>

                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={
                        handleCloseUploadModal
                      }
                      disabled={
                        uploadingDocument
                      }
                    />

                  </div>

                  <div className="modal-body p-4">

                    <div
                      className="rounded-3 p-3 mb-4"
                      style={{
                        background:
                          "#f1f5f9",
                      }}
                    >

                      <div className="row">

                        <div className="col-6">

                          <small className="text-muted">
                            Reservation
                          </small>

                          <div className="fw-bold text-primary">
                            #
                            {
                              selectedReservation.id
                            }
                          </div>

                        </div>

                        <div className="col-6">

                          <small className="text-muted">
                            Room
                          </small>

                          <div className="fw-bold">
                            {
                              selectedReservation.roomNumber
                            }
                          </div>

                        </div>

                        <div className="col-12 mt-2">

                          <small className="text-muted">
                            Guest
                          </small>

                          <div className="fw-semibold">

                            {selectedReservation.guest
                              ? `${selectedReservation.guest.firstName} ${selectedReservation.guest.lastName}`
                              : `Guest #${selectedReservation.guestId}`}

                          </div>

                        </div>

                      </div>

                    </div>

                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        Document Type
                      </label>

                      <select
                        className="form-select form-select-lg"
                        value={
                          documentType
                        }
                        onChange={(e) =>
                          setDocumentType(
                            e.target.value
                          )
                        }
                      >

                        <option value="Passport">
                          Passport
                        </option>

                        <option value="Driving Licence">
                          Driving Licence
                        </option>

                        <option value="National ID">
                          National ID
                        </option>

                        <option value="Other">
                          Other
                        </option>

                      </select>

                    </div>

                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        Identity Document
                      </label>

                      <input
                        id="identityDocumentFile"
                        type="file"
                        className="form-control form-control-lg"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) =>
                          setDocumentFile(
                            e.target.files[0] ||
                              null
                          )
                        }
                      />

                      <div className="form-text">
                        Accepted: JPG, JPEG, PNG, PDF.
                        Maximum size: 5 MB.
                      </div>

                    </div>

                    {documentFile && (

                      <div className="alert alert-info d-flex align-items-center">

                        <span className="fs-4 me-2">
                          📎
                        </span>

                        <div>

                          <strong>
                            Selected:
                          </strong>

                          <div className="small">
                            {
                              documentFile.name
                            }
                          </div>

                        </div>

                      </div>

                    )}

                  </div>

                  <div className="modal-footer border-0 p-4">

                    <button
                      type="button"
                      className="btn btn-light border px-4"
                      onClick={
                        handleCloseUploadModal
                      }
                      disabled={
                        uploadingDocument
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary px-4"
                      onClick={
                        handleUploadDocument
                      }
                      disabled={
                        uploadingDocument ||
                        !documentFile
                      }
                      style={{
                        background:
                          "linear-gradient(135deg, #2563eb, #4f46e5)",
                        border: "none",
                      }}
                    >

                      {uploadingDocument ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                          />

                          Uploading...
                        </>
                      ) : (
                        <>
                          📤 Upload Document
                        </>
                      )}

                    </button>

                  </div>

                </div>

              </div>

            </div>

          </>
        )}

      {/* =====================================================
          PAYMENT MODAL
      ====================================================== */}

      {showPaymentModal &&
        paymentReservation && (

          <>

            <div
              className="modal-backdrop fade show"
              style={{
                zIndex: 1040,
              }}
            />

            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              style={{
                zIndex: 1050,
              }}
            >

              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >

                <div
                  className="modal-content border-0 shadow-lg"
                  style={{
                    borderRadius:
                      "18px",
                  }}
                >

                  <div
                    className="modal-header text-white border-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #172554, #2563eb)",
                      borderRadius:
                        "18px 18px 0 0",
                    }}
                  >

                    <div>

                      <h5 className="modal-title fw-bold">
                        💳 Guest Payment
                      </h5>

                      <small className="text-white-50">
                        Complete payment before checkout
                      </small>

                    </div>

                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={
                        handleClosePayment
                      }
                      disabled={
                        processingPayment
                      }
                    />

                  </div>

                  <div className="modal-body p-4">

                    <div className="bg-light rounded-3 p-3 mb-4">

                      <div className="row">

                        <div className="col-6">

                          <small className="text-muted">
                            Reservation
                          </small>

                          <div className="fw-bold text-primary">
                            #
                            {
                              paymentReservation.id
                            }
                          </div>

                        </div>

                        <div className="col-6">

                          <small className="text-muted">
                            Room
                          </small>

                          <div className="fw-bold">
                            Room{" "}
                            {
                              paymentReservation.roomNumber
                            }
                          </div>

                        </div>

                        <div className="col-12 mt-3">

                          <small className="text-muted">
                            Guest
                          </small>

                          <div className="fw-semibold">

                            {paymentReservation.guest
                              ? `${paymentReservation.guest.firstName} ${paymentReservation.guest.lastName}`
                              : `Guest #${paymentReservation.guestId}`}

                          </div>

                        </div>

                      </div>

                    </div>

                    {loadingPayment ? (

                      <div className="text-center py-4">

                        <div
                          className="spinner-border text-primary"
                          role="status"
                        />

                        <p className="text-muted mt-3 mb-0">
                          Loading payment...
                        </p>

                      </div>

                    ) : payment ? (

                      <>

                        <div className="text-center mb-4">

                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                            style={{
                              width: "70px",
                              height: "70px",
                              background:
                                "#dbeafe",
                              fontSize: "32px",
                            }}
                          >
                            💳
                          </div>

                          <h5 className="fw-bold">
                            Payment Required
                          </h5>

                          <p className="text-muted mb-0">
                            Complete the demo payment to checkout the guest.
                          </p>

                        </div>

                        <div
                          className="text-center rounded-3 p-4 mb-3"
                          style={{
                            background:
                              "#f8fafc",
                          }}
                        >

                          <small className="text-muted">
                            Total Amount
                          </small>

                          <div
                            className="fw-bold text-primary"
                            style={{
                              fontSize:
                                "40px",
                            }}
                          >
                            ₹
                            {Number(
                              payment.amount ||
                                paymentAmount ||
                                0
                            ).toFixed(2)}
                          </div>

                        </div>

                        {payment.id && (

                          <div className="mb-3">

                            <label className="form-label fw-semibold">
                              Payment ID
                            </label>

                            <input
                              type="text"
                              className="form-control"
                              value={
                                payment.id
                              }
                              readOnly
                            />

                          </div>

                        )}

                        {payment.paymentLink && (

                          <div className="mb-3">

                            <label className="form-label fw-semibold">
                              Payment Link
                            </label>

                            <div className="input-group">

                              <input
                                type="text"
                                className="form-control"
                                value={
                                  payment.paymentLink
                                }
                                readOnly
                              />

                              <a
                                href={
                                  payment.paymentLink
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline-primary"
                              >
                                Open
                              </a>

                            </div>

                          </div>

                        )}

                        {payment.status ===
                        "PAID" ? (

                          <div className="alert alert-success">

                            ✓ Payment already completed.

                          </div>

                        ) : (

                          <>

                            <div className="alert alert-warning">

                              <strong>
                                Demo Payment
                              </strong>

                              <div className="small mt-1">
                                This is a simulated payment.
                                No real money will be charged.
                              </div>

                            </div>

                            <button
                              type="button"
                              className="btn btn-success btn-lg w-100"
                              onClick={
                                handleDemoPayment
                              }
                              disabled={
                                processingPayment
                              }
                            >

                              {processingPayment ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                  />

                                  Processing Payment...
                                </>
                              ) : (
                                <>
                                  ✓ Complete Demo Payment
                                </>
                              )}

                            </button>

                          </>

                        )}

                      </>

                    ) : (

                      <div className="alert alert-danger">

                        Unable to create payment.

                      </div>

                    )}

                  </div>

                  <div className="modal-footer border-0 p-4">

                    <button
                      type="button"
                      className="btn btn-light border px-4"
                      onClick={
                        handleClosePayment
                      }
                      disabled={
                        processingPayment
                      }
                    >
                      Cancel
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </>
        )}

    </div>
  );
}

export default App;