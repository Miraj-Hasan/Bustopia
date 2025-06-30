import { getAllCompanies, getReviewsByBusId, getSpecificBus, getSpecificCompanyBuses, getTravelledBuses, uploadReviewImages, submitReview } from "../../Api/ApiCalls";
import { Navbar } from "../../Components/Navbar/Navbar";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import { formatDistanceToNow } from "date-fns";


function Review() {

    const [selectedSearchOption, setSelectedSearchOption] = useState("");
    const [searchedCompany, setSearchedCompany] = useState("");
    const [searchedLicense, setSearchedLicense] = useState("");
    const [loading, setLoading] = useState(false);
    const [allCompanies, setAllCompanies] = useState([]);
    const [hasCompaniesFetched, setHasCompaniesFetched] = useState(false);
    const [selectedCompanyBuses, setSelectedCompanyBuses] = useState([]);
    const [buses, setBuses] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
    const [expandedCardIndex, setExpandedCardIndex] = useState(null);
    const [reviews, setReviews] = useState({});
    const [pagesNeeded, setPagesNeeded] = useState(true);
    const [reviewText, setReviewText] = useState("");
    const [starRating, setStarRating] = useState(0);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [reviewImages, setReviewImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isUploadingImages, setIsUploadingImages] = useState(false);

    const size = 10;

    const { user } = useContext(UserContext);

    async function getLicensedBus(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await getSpecificBus(searchedLicense, user.id);
            console.log("license: ", searchedLicense);
            if (response.status === 200) {
                toast.success("found the bus!");
                setBuses([response.data.bus]);
                setReviews(prev => ({ ...prev, [response.data.bus.busId]: response.data.reviews }));
                setExpandedCardIndex(0);
            }
        } catch (e) {
            toast.error("License no is invalid!");
        } finally {
            setLoading(false);
        }
    }

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        // Validate number of images (example: max 4)
        if (files.length + reviewImages.length > 4) {
            toast.error("You can upload up to 4 images");
            return;
        }

        // Validate image types and size
        const validFiles = files.filter(file => {
            if (!file.type.match('image.*')) {
                toast.error(`${file.name} is not an image file`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error(`${file.name} is too large (max 5MB)`);
                return false;
            }
            return true;
        });

        // Create previews
        const newPreviews = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setReviewImages(prev => [...prev, ...validFiles]);
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        // Revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(imagePreviews[index].preview);

        setReviewImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitReview = async (busId) => {
        if (!reviewText.trim()) {
            toast.error("Please write a review before submitting");
            return;
        }

        if (starRating === 0) {
            toast.error("Please select a star rating");
            return;
        }

        setIsSubmittingReview(true);

        try {
            // First upload images if any
            let imageUrls = [];
            if (reviewImages.length > 0) {
                setIsUploadingImages(true);
                const formData = new FormData();
                reviewImages.forEach(file => {
                    formData.append('images', file);
                });

                const uploadResponse = await uploadReviewImages(formData);
                imageUrls = uploadResponse.data;
                console.log("urls: ", imageUrls);
                setIsUploadingImages(false);
            }

            // Then submit the review with image URLs
            const response = await submitReview({
                busId: busId,
                userId: user.id,
                message: reviewText,
                stars: starRating,
                images: imageUrls || [],
            });

            if (response.status === 200) {
                toast.success("Review submitted successfully!");
                setReviewText("");
                setStarRating(0);
                setReviewImages([]);
                setImagePreviews([]);
                // Refresh the reviews for this bus
                fetchReviews(busId);
            }
        } catch (error) {
            toast.error("Failed to submit review");
            console.error("Review submission error:", error);
        } finally {
            setIsSubmittingReview(false);
            setIsUploadingImages(false);
        }
    };

    const handleCompanySelect = async (companyName, pageToFetch = 0) => {
        try {
            const response = await getSpecificCompanyBuses(companyName, pageToFetch, size, user.id);
            setSelectedCompanyBuses(response.data.content);
            setBuses(response.data.content);
            setPage(response.data.number);
            setTotalPages(response.data.totalPages);
            setExpandedCardIndex(null);
            setPagesNeeded(true);
        } catch (error) {
            console.error("Error fetching bus data:", error);
        }
    };

    const fetchReviews = async (busId) => {
        try {
            const response = await getReviewsByBusId(busId);
            setReviews(prev => ({ ...prev, [busId]: response.data }));
        } catch (err) {
            console.error("Error fetching reviews", err);
        }
    };

    // Fetch once when "by company" is selected for the first time
    useEffect(() => {
        const fetchBus = async () => {
            if (selectedSearchOption === "by company" && !hasCompaniesFetched) {
                try {
                    setBuses([]);
                    const response = await getAllCompanies();
                    if (response.status === 200) {
                        setAllCompanies(response.data);
                        setHasCompaniesFetched(true);
                    }
                } catch (e) {
                    toast.error("Error in fetching the companies!");
                }
            } else if (selectedSearchOption === "by buses travelled") {
                try {
                    setBuses([]);
                    const response = await getTravelledBuses(user.id);
                    if (response.status === 200) {
                        setBuses(response.data);
                        setPagesNeeded(false);
                    }
                } catch (e) {
                    toast.error("Error in fetching the companies!");
                }
            }
        };

        setBuses([]);

        fetchBus();

        if (selectedSearchOption === "by license no" || selectedSearchOption === "by buses travelled") {
            setPagesNeeded(false);
        }
    }, [selectedSearchOption, hasCompaniesFetched]);

    return (
        <div className="d-flex">
            {/* Sidebar */}
            <div style={{ width: "250px" }}>
                <Navbar />
            </div>

            {/* main contents */}
            <div className="container">

                <div style={{
                    minHeight: "100vh",
                    backgroundColor: "#6C8EBF",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    paddingTop: "25px",
                }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                        <h1
                            style={{
                                fontSize: "2.5rem",
                                fontWeight: "600",
                                color: "white",
                                textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
                                marginBottom: "10px",
                            }}>
                            Bus Review
                        </h1>

                        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: "20px",
                                        marginTop: "40px",
                                    }}
                                >
                                    <label
                                        style={{
                                            fontWeight: "600",
                                            color: "#ffffff",
                                            fontSize: "1.1rem",
                                        }}
                                    >
                                        Select Bus:
                                    </label>

                                    {/* buttons */}
                                    {["by license no", "by company", "by buses travelled"].map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => setSelectedSearchOption(option)}
                                            style={{
                                                padding: "10px 20px",
                                                backgroundColor: selectedSearchOption === option ? "#004080" : "#ffffff",
                                                color: selectedSearchOption === option ? "#ffffff" : "#004080",
                                                border: "2px solid #004080",
                                                borderRadius: "8px",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {selectedSearchOption === "by license no" && (

                                    <form
                                        onSubmit={getLicensedBus}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            marginTop: "20px",
                                        }}>

                                        <input
                                            type="text"
                                            placeholder="Search by license no"
                                            value={searchedLicense}
                                            onChange={(e) => setSearchedLicense(e.target.value)}
                                            style={{
                                                padding: "10px",
                                                borderRadius: "6px",
                                                border: "1px solid #ccc",
                                                width: "250px",
                                            }}
                                        />

                                        <button type="submit"
                                            style={{
                                                padding: "10px 20px",
                                                backgroundColor: "#004080",
                                                color: "#ffffff",
                                                border: "none",
                                                borderRadius: "6px",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                        aria-hidden="true"
                                                    ></span>
                                                    Searching...
                                                </>
                                            ) : (
                                                "Search"
                                            )}
                                        </button>
                                    </form>

                                )}

                                {(selectedSearchOption === "by company") && (
                                    <select
                                        className="form-select form-select-sm"
                                        aria-label="Small select example"
                                        style={{
                                            padding: "10px",
                                            borderRadius: "6px",
                                            border: "1px solid #ccc",
                                            width: "250px",
                                            marginTop: "20px"
                                        }}
                                        defaultValue=""
                                        onChange={(e) => {
                                            const company = e.target.value;
                                            setSearchedCompany(company);
                                            handleCompanySelect(company, 0);
                                        }}
                                    >
                                        <option value="" disabled>
                                            Select a bus company
                                        </option>
                                        {allCompanies.map((company, index) => (
                                            <option key={index} value={company}>
                                                {company}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>


                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >

                            <div className="container mt-4" style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "100%",
                            }}>
                                <div className="row justify-content-center" style={{ maxWidth: "900px", width: "100%" }}>
                                    {buses.map((bus, index) => (
                                        <div key={index} className="col-12 mb-4 d-flex justify-content-center">
                                            <div style={{ width: "100%", maxWidth: "800px" }}>
                                                <div className="card" style={{
                                                    width: "100%",
                                                    maxWidth: "800px",
                                                    minHeight: "200px",
                                                    height: "100%",
                                                    transition: "transform 0.3s ease",
                                                    transform: hoveredCardIndex === index ? "scale(1.03)" : "scale(1)",
                                                    boxShadow:
                                                        hoveredCardIndex === index ? "0 10px 20px rgba(0,0,0,0.2)" : "none",
                                                }}
                                                    onMouseEnter={() => setHoveredCardIndex(index)}
                                                    onMouseLeave={() => setHoveredCardIndex(null)}
                                                    onClick={() => {
                                                        if (expandedCardIndex === index) {
                                                            setExpandedCardIndex(null);
                                                        } else {
                                                            setExpandedCardIndex(index);
                                                            fetchReviews(bus.busId);
                                                        }
                                                    }}
                                                >
                                                    <div className="row g-0" style={{
                                                        display: "flex",
                                                        height: "100%"
                                                    }}>
                                                        <div className="col-md-4" style={{ display: "flex", height: "100%" }}>
                                                            <img
                                                                src={bus.photo || "https://via.placeholder.com/150"}
                                                                alt="Bus"
                                                                style={{
                                                                    height: "100%",
                                                                    width: "100%",
                                                                    objectFit: "cover",
                                                                    borderTopLeftRadius: "0.5rem",
                                                                    borderBottomLeftRadius: "0.5rem",
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="col-md-8">
                                                            <div className="card-body d-flex flex-column justify-content-center h-100">
                                                                <h5 className="card-title">{bus.companyName}</h5>
                                                                <p className="card-text mb-1">{bus.licenseNo}</p>
                                                                <p className="card-text">
                                                                    <small className="text-body-secondary">
                                                                        {bus.stops?.join(" → ") || "No stops listed"}
                                                                    </small>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Expanded section for reviews */}
                                                    {expandedCardIndex === index && (
                                                        <div
                                                            style={{
                                                                backgroundColor: "#fdf3d2",
                                                                padding: "15px",
                                                                borderTop: "1px solid #ccc"
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <h6 style={{ fontWeight: "600" }}>Reviews:</h6>
                                                            {reviews[bus.busId]?.length > 0 ? (
                                                                reviews[bus.busId].map((review, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        style={{
                                                                            display: "flex",
                                                                            alignItems: "flex-start",
                                                                            gap: "15px",
                                                                            marginBottom: "15px",
                                                                            backgroundColor: "#ffffff",
                                                                            padding: "15px",
                                                                            borderRadius: "10px",
                                                                            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={review.userPhoto || "https://via.placeholder.com/50"}
                                                                            alt="User"
                                                                            style={{
                                                                                width: "50px",
                                                                                height: "50px",
                                                                                borderRadius: "50%",
                                                                                objectFit: "cover",
                                                                            }}
                                                                        />
                                                                        <div style={{ flex: 1 }}>
                                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                                <span style={{ fontWeight: "bold", color: "#333" }}>{review.userName}</span>
                                                                                <span style={{ fontSize: "0.9rem", color: "#777" }}>
                                                                                    {formatDistanceToNow(new Date(review.reviewTime), { addSuffix: true })}
                                                                                </span>
                                                                            </div>

                                                                            <div style={{ color: "#ffc107", margin: "5px 0" }}>
                                                                                {"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}
                                                                            </div>

                                                                            <p style={{ margin: "0", color: "#444" }}>{review.message}</p>

                                                                            {review.images?.length > 0 && (
                                                                                <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                                                                    {review.images.map((img, i) => (
                                                                                        <img key={i} src={img} alt="Review" style={{
                                                                                            width: "100px", 
                                                                                            height: "100px",
                                                                                            objectFit: "cover",
                                                                                            borderRadius: "8px"
                                                                                        }} />
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p style={{ marginTop: "10px" }}>No reviews found.</p>
                                                            )}

                                                            {bus.canCurrentUserReview && (
                                                                <div style={{ marginTop: "20px" }}>
                                                                    <h6 style={{ fontWeight: "600" }}>Write a Review:</h6>

                                                                    {/* Star Rating */}
                                                                    <div style={{ marginBottom: "10px", display: "flex", gap: "5px" }}>
                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                            <span
                                                                                key={star}
                                                                                style={{
                                                                                    cursor: "pointer",
                                                                                    fontSize: "24px",
                                                                                    color: star <= (hoveredStar || starRating) ? "#ffc107" : "#e4e5e9",
                                                                                }}
                                                                                onMouseEnter={() => setHoveredStar(star)}
                                                                                onMouseLeave={() => setHoveredStar(0)}
                                                                                onClick={() => setStarRating(star)}
                                                                            >
                                                                                {star <= (hoveredStar || starRating) ? "★" : "☆"}
                                                                            </span>
                                                                        ))}
                                                                    </div>

                                                                    <textarea
                                                                        placeholder="Write your review here..."
                                                                        rows={4}
                                                                        value={reviewText}
                                                                        style={{
                                                                            width: "100%",
                                                                            padding: "10px",
                                                                            borderRadius: "8px",
                                                                            border: "1px solid #ccc",
                                                                            resize: "none",
                                                                        }}
                                                                        onChange={(e) => setReviewText(e.target.value)}
                                                                    ></textarea>

                                                                    {/* Image Upload Section */}
                                                                    <div style={{ marginTop: "15px" }}>
                                                                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                                                                            Add Photos (optional):
                                                                        </label>

                                                                        {/* Hidden file input */}
                                                                        <input
                                                                            type="file"
                                                                            id="review-images"
                                                                            multiple
                                                                            accept="image/*"
                                                                            onChange={handleImageUpload}
                                                                            style={{ display: "none" }}
                                                                        />

                                                                        {/* Custom upload button */}
                                                                        <label
                                                                            htmlFor="review-images"
                                                                            style={{
                                                                                display: "inline-block",
                                                                                padding: "8px 16px",
                                                                                backgroundColor: "#f0f0f0",
                                                                                border: "1px dashed #ccc",
                                                                                borderRadius: "6px",
                                                                                cursor: "pointer",
                                                                                marginBottom: "10px",
                                                                            }}
                                                                        >
                                                                            Choose Images
                                                                        </label>

                                                                        {/* Image previews */}
                                                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                                                                            {imagePreviews.map((preview, index) => (
                                                                                <div key={index} style={{ position: "relative" }}>
                                                                                    <img
                                                                                        src={preview.preview}
                                                                                        alt={`Preview ${index}`}
                                                                                        style={{
                                                                                            width: "80px",
                                                                                            height: "80px",
                                                                                            objectFit: "cover",
                                                                                            borderRadius: "6px",
                                                                                            border: "1px solid #ddd",
                                                                                        }}
                                                                                    />
                                                                                    <button
                                                                                        onClick={() => removeImage(index)}
                                                                                        style={{
                                                                                            position: "absolute",
                                                                                            top: "-8px",
                                                                                            right: "-8px",
                                                                                            background: "#ff4444",
                                                                                            color: "white",
                                                                                            border: "none",
                                                                                            borderRadius: "50%",
                                                                                            width: "20px",
                                                                                            height: "20px",
                                                                                            display: "flex",
                                                                                            alignItems: "center",
                                                                                            justifyContent: "center",
                                                                                            cursor: "pointer",
                                                                                            fontSize: "12px",
                                                                                        }}
                                                                                    >
                                                                                        ×
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    <button
                                                                        className="btn btn-success mt-2"
                                                                        style={{ borderRadius: "6px", padding: "8px 16px" }}
                                                                        onClick={() => handleSubmitReview(bus.busId)}
                                                                        disabled={isSubmittingReview || isUploadingImages}
                                                                    >
                                                                        {isSubmittingReview || isUploadingImages ? (
                                                                            <>
                                                                                <span
                                                                                    className="spinner-border spinner-border-sm me-2"
                                                                                    role="status"
                                                                                    aria-hidden="true"
                                                                                ></span>
                                                                                {isUploadingImages ? "Uploading Images..." : "Submitting..."}
                                                                            </>
                                                                        ) : (
                                                                            "Submit Review"
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {pagesNeeded && (
                                <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                                    <button
                                        onClick={() => handleCompanySelect(searchedCompany, page - 1)}
                                        disabled={page === 0}
                                        className="btn btn-primary me-2"
                                    >
                                        Previous
                                    </button>
                                    <span style={{ color: "white", fontWeight: 600 }}>
                                        Page {page + 1} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => handleCompanySelect(searchedCompany, page + 1)}
                                        disabled={page + 1 >= totalPages}
                                        className="btn btn-primary ms-2"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            </div>
        </div >

    );
}

export default Review;