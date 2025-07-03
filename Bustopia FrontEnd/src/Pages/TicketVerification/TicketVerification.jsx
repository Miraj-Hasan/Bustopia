import { useEffect, useState } from "react";
import { Navbar } from "../../Components/Navbar/Navbar";
import { getAllCompanies, verifyTicket } from "../../Api/ApiCalls";
import { toast } from "react-toastify";

function TicketVerification() {
    const [ticketCode, setTicketCode] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [allCompanies, setAllCompanies] = useState([]);
    const [hasCompaniesFetched, setHasCompaniesFetched] = useState(false);
    const [ticket, setTicket] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        const fetchBusCompanies = async () => {
            try {
                const response = await getAllCompanies();
                if (response.status === 200) {
                    setAllCompanies(response.data);
                    setHasCompaniesFetched(true);
                }
            } catch (e) {
                toast.error("Error in fetching the companies!");
            }
        }

        if (!hasCompaniesFetched) {
            fetchBusCompanies();
        }
    }, [hasCompaniesFetched]);

    const handleVerify = async () => {
        if (!ticketCode || !companyName) {
            toast.error("Please enter ticket code and select company");
            return;
        }

        setIsVerifying(true);
        try {
            const response = await verifyTicket(ticketCode, companyName);
            if (response.status === 200) {
                if (response.data.verified) {
                    toast.success("Ticket verification successful!");
                } else {
                    toast.error("Ticket is not verified!");
                }
                setTicket(response.data);
            }
        } catch (e) {
            toast.error("Error in verifying the ticket!");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="d-flex min-vh-100">
            {/* Sidebar */}
            <div style={{ width: "250px", backgroundColor: "#f8f9fa" }}>
                <Navbar />
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 p-4">
                <div className="container">
                    <h1 className="mb-4 text-primary">Ticket Verification</h1>
                    
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <h5 className="card-title mb-3">Verify Ticket</h5>
                            
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light">
                                            <i className="bi bi-ticket-detailed"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter ticket code"
                                            value={ticketCode}
                                            onChange={(e) => setTicketCode(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="col-md-4">
                                    <select
                                        className="form-select"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        required
                                    >
                                        <option value="">Select company</option>
                                        {allCompanies.map((company, index) => (
                                            <option key={index} value={company}>
                                                {company}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="col-md-2">
                                    <button
                                        type="button"
                                        className="btn btn-primary w-100"
                                        onClick={handleVerify}
                                        disabled={isVerifying}
                                    >
                                        {isVerifying ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Verifying...
                                            </>
                                        ) : "Verify"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Display */}
                    {ticket ? (
                        ticket.verified ? (
                            <div className="card shadow-lg mt-4">
                                <div className="row g-0">
                                    <div className="col-md-4">
                                        <img 
                                            src={ticket.busPhoto || "https://via.placeholder.com/300x200?text=Bus+Image"} 
                                            className="img-fluid rounded-start h-100 object-fit-cover" 
                                            alt="Bus" 
                                        />
                                    </div>
                                    <div className="col-md-8">
                                        <div className="card-body">
                                            <h3 className="card-title text-success mb-4">Valid Ticket</h3>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <p className="mb-2"><strong>Passenger:</strong> {ticket.userName}</p>
                                                    <p className="mb-2"><strong>Company:</strong> {ticket.busCompany}</p>
                                                    <p className="mb-2"><strong>Category:</strong> {ticket.busType}</p>
                                                </div>
                                                <div className="col-md-6">
                                                    <p className="mb-2"><strong>Date:</strong> {ticket.date}</p>
                                                    <p className="mb-2"><strong>Departure Time:</strong> {ticket.scheduledStartTime}</p>
                                                    <p className="mb-2"><strong>Price:</strong> {ticket.price} Taka</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 text-center">
                                                <span className="badge bg-success p-2">
                                                    <i className="bi bi-check-circle-fill me-2"></i>
                                                    Verified Successfully
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="alert alert-danger mt-4" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                This ticket is not valid. Please check the code and company and try again.
                            </div>
                        )
                    ) : (
                        <div className="card shadow-sm mt-4">
                            <div className="card-body text-center text-muted">
                                <i className="bi bi-ticket-detailed fs-1 mb-3"></i>
                                <h5>No ticket verified yet</h5>
                                <p>Enter a ticket code and select company to verify</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TicketVerification;