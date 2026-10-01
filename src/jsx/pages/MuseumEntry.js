// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import swal from 'sweetalert';

// const MuseumEntry = () => {
//   const GALLERY_PRICE = 50;
// const MOVIE_PRICE = 30;
//   // const [formData, setFormData] = useState({
//   //   firstname: '',
//   //   phone: '',
//   //   address: '',
//   //   num_of_persons: '1',
//   //   total_amt: '50',
//   //   payment: '0',
//   //   gallery: '1',
//   //   movie_show: '0',
//   //   discount: '0',
//   //   image_name: '',
//   //   txn_id: ''
//   // });
//   const [formData, setFormData] = useState({
//   firstname: '',
//   phone: '',
//   address: '',
//   num_of_persons: '1',
//   total_amt: '50',
//   payment: '0',
//   gallery: '1',
//   movie_show: '0',   // 👉 now number of tickets
//   discount: '0',
//   image_name: '',
//   txn_id: ''
// });

//   const [loading, setLoading] = useState(false);

// useEffect(() => {
//   const persons = Number(formData.num_of_persons) || 0;
//   const gallery = formData.gallery === '1';
//   const movieTickets = Number(formData.movie_show) || 0;
//   const discount = Number(formData.discount) || 0;

//   let total = 0;

//   // Gallery → sobai
//   if (gallery) total += persons * GALLERY_PRICE;

//   // Movie → ticket onujayi
//   total += movieTickets * MOVIE_PRICE;

//   total = total - discount;

//   setFormData(prev => ({
//     ...prev,
//     total_amt: total > 0 ? total.toString() : '0'
//   }));

// }, [
//   formData.num_of_persons,
//   formData.gallery,
//   formData.movie_show,
//   formData.discount
// ]);

//  const handleChange = (e) => {
//   const { name, value, type, checked } = e.target;

//   setFormData(prev => ({
//     ...prev,
//     [name]:
//       type === 'checkbox'
//         ? (checked ? '1' : '0')
//         : value
//   }));
// };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
// if (Number(formData.movie_show) > Number(formData.num_of_persons)) {
//   setLoading(false);
//   return swal("Error!", "Movie tickets cannot exceed number of persons", "error");
// }
// if (formData.payment === '1' && !formData.txn_id) {
//   setLoading(false);
//   return swal("Error!", "Transaction ID required!", "error");
// }
// if (Number(formData.discount) > Number(formData.total_amt)) {
//   setLoading(false);
//   return swal("Error!", "Discount cannot exceed total amount", "error");
// }
//     try {
//       const response = await axios.post('https://chitanya-musium-backend-new-and-latest.onrender.com/api/museum', formData);
      
//       swal("Success!", "Museum entry created successfully!", "success");
      
//       // Reset form
//       setFormData({
//         firstname: '',
//         phone: '',
//         address: '',
//         num_of_persons: '1',
//         total_amt: '50',
//         payment: '0',
//         gallery: '1',
//         movie_show: '0',
//         discount: '0',
//         image_name: '',
//         txn_id: ''
//       });
//     } catch (error) {
//       swal("Error!", error.response?.data?.error || "Failed to create entry", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container-fluid">
//       <div className="row">
//         <div className="col-lg-12">
//           <div className="card">
//             <div className="card-header">
//               <h4 className="card-title">Museum Entry Form</h4>
//             </div>
//             <div className="card-body">
//               <form onSubmit={handleSubmit}>
//                 <div className="row">
//                   <div className="col-lg-6 mb-3">
//                     <label className="form-label">Full Name *</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="firstname"
//                       value={formData.firstname}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
                  
//                   <div className="col-lg-6 mb-3">
//                     <label className="form-label">Phone Number *</label>
//                     <input
//                       type="tel"
//                       className="form-control"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
                  
//                   <div className="col-lg-12 mb-3">
//                     <label className="form-label">Address *</label>
//                     <textarea
//                       className="form-control"
//                       name="address"
//                       rows="3"
//                       value={formData.address}
//                       onChange={handleChange}
//                       required
//                     ></textarea>
//                   </div>
                  
//                   <div className="col-lg-4 mb-3">
//                     <label className="form-label">Number of Persons</label>
//                     <input
//                       type="number"
//                       className="form-control"
//                       name="num_of_persons"
//                       value={formData.num_of_persons}
//                       onChange={handleChange}
//                       min="1"
//                     />
//                   </div>
                  
//                   <div className="col-lg-4 mb-3">
//                     <label className="form-label">Total Amount</label>
//                     <input
//                       type="number"
//                       className="form-control"
//                       name="total_amt"
//                       value={formData.total_amt}
//                         readOnly
//                       onChange={handleChange}
//                       min="0"
//                     />
//                   </div>
                  
//                   <div className="col-lg-4 mb-3">
//                     <label className="form-label">Discount</label>
//                     <input
//                       type="number"
//                       className="form-control"
//                       name="discount"
//                       value={formData.discount}
//                       onChange={handleChange}
//                       min="0"
//                     />
//                   </div>
                  
//                   <div className="col-lg-6 mb-3">
//                     <div className="form-check">
//                       <input
//                         className="form-check-input"
//                         type="checkbox"
//                         name="gallery"
//                         checked={formData.gallery === '1'}
//                         onChange={handleChange}
//                       />
//                       <label className="form-check-label">Gallery Visit</label>
//                     </div>
//                   </div>
                  
//                   <div className="col-lg-6 mb-3">
//                    <div className="col-lg-4 mb-3">
//   <label className="form-label">Movie Tickets</label>
//   <input
//     type="number"
//     className="form-control"
//     name="movie_show"
//     value={formData.movie_show}
//     onChange={handleChange}
//     min="0"
//     max={formData.num_of_persons} // optional
//   />
// </div>
//                   </div>
                  
//                   <div className="col-lg-6 mb-3">
//                     <label className="form-label">Payment Method</label>
//                     <select
//                       className="form-control"
//                       name="payment"
//                       value={formData.payment}
//                       onChange={handleChange}
//                     >
//                       <option value="0">Cash</option>
//                       <option value="1">Online</option>
//                     </select>
//                   </div>
                  
//                   <div className="col-lg-6 mb-3">
//                     <label className="form-label">Transaction ID</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="txn_id"
//                       value={formData.txn_id}
//                       onChange={handleChange}
//                       placeholder="For online payments"
//                     />
//                   </div>
//                 </div>
                
//                 <div className="text-end">
//                   <button
//                     type="submit"
//                     className="btn btn-primary"
//                     disabled={loading}
//                   >
//                     {loading ? 'Creating...' : 'Create Entry'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MuseumEntry;



// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import swal from 'sweetalert';

// const MuseumEntry = () => {
//   const GALLERY_PRICE = 50;
//   const MOVIE_PRICE = 30;

//   const [formData, setFormData] = useState({
//     firstname: '',
//     phone: '',
//     address: '',
//     num_of_persons: '1',
//     total_amt: '50',
//     payment: '0',
//     gallery: '1',
//     movie_show: '0',
//     discount: '0',
//     image_name: '',
//     txn_id: ''
//   });

//   const [loading, setLoading] = useState(false);

//   // ✅ AUTO CALCULATION
//   useEffect(() => {
//     const persons = Number(formData.num_of_persons) || 0;
//     const gallery = formData.gallery === '1';
//     const movieTickets = Number(formData.movie_show) || 0;
//     const discount = Number(formData.discount) || 0;

//     let total = 0;

//     if (gallery) total += persons * GALLERY_PRICE;
//     total += movieTickets * MOVIE_PRICE;

//     total = total - discount;

//     setFormData(prev => ({
//       ...prev,
//       total_amt: total > 0 ? total.toString() : '0'
//     }));
//   }, [
//     formData.num_of_persons,
//     formData.gallery,
//     formData.movie_show,
//     formData.discount
//   ]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     setFormData(prev => ({
//       ...prev,
//       [name]:
//         type === 'checkbox'
//           ? (checked ? '1' : '0')
//           : value
//     }));
//   };

//   // ✅ SUBMIT
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     // validations
//     if (Number(formData.movie_show) > Number(formData.num_of_persons)) {
//       setLoading(false);
//       return swal("Error!", "Movie tickets cannot exceed number of persons", "error");
//     }

//     if (formData.payment === '1' && !formData.txn_id) {
//       setLoading(false);
//       return swal("Error!", "Transaction ID required!", "error");
//     }

//     if (Number(formData.discount) > Number(formData.total_amt)) {
//       setLoading(false);
//       return swal("Error!", "Discount cannot exceed total amount", "error");
//     }

//     try {
//       await axios.post(
//         'https://chitanya-musium-backend-new-and-latest.onrender.com/api/museum',
//         formData
//       );

//       swal("Success!", "Museum entry created successfully!", "success");

//       setFormData({
//         firstname: '',
//         phone: '',
//         address: '',
//         num_of_persons: '1',
//         total_amt: '50',
//         payment: '0',
//         gallery: '1',
//         movie_show: '0',
//         discount: '0',
//         image_name: '',
//         txn_id: ''
//       });

//     } catch (error) {
//       swal("Error!", error.response?.data?.error || "Failed to create entry", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container-fluid py-4">
//       <div className="card shadow-lg border-0">
//         <div className="card-body">

//           {/* ✅ PRICE CARDS */}
//           <div className="row mb-4">
//             <div className="col-lg-6">
//               <div className="card bg-light text-center shadow-sm">
//                 <div className="card-body">
//                   <h5>🎟️ Museum Entry</h5>
//                   <h3 className="text-primary">₹{GALLERY_PRICE}</h3>
//                   <small>per person</small>
//                 </div>
//               </div>
//             </div>

//             <div className="col-lg-6">
//               <div className="card bg-light text-center shadow-sm">
//                 <div className="card-body">
//                   <h5>🎬 Movie Ticket</h5>
//                   <h3 className="text-success">₹{MOVIE_PRICE}</h3>
//                   <small>per ticket</small>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit}>

//             {/* PERSONAL */}
//             <h5 className="mb-3 border-bottom pb-2">👤 Personal Details</h5>

//             <div className="row">
//               <div className="col-lg-6 mb-3">
//                 <input type="text" className="form-control" placeholder="Full Name"
//                   name="firstname" value={formData.firstname} onChange={handleChange} required />
//               </div>

//               <div className="col-lg-6 mb-3">
//                 <input type="tel" className="form-control" placeholder="Phone Number"
//                   name="phone" value={formData.phone} onChange={handleChange} required />
//               </div>

//               <div className="col-lg-12 mb-3">
//                 <textarea className="form-control" placeholder="Address"
//                   name="address" value={formData.address} onChange={handleChange} required />
//               </div>
//             </div>

//             {/* TICKET */}
//             <h5 className="mt-4 mb-3 border-bottom pb-2">🎟️ Ticket Details</h5>

//             <div className="row">
//               <div className="col-lg-4 mb-3">
//                 <label>Persons</label>
//                 <input type="number" className="form-control"
//                   name="num_of_persons"
//                   value={formData.num_of_persons}
//                   onChange={handleChange} min="1" />
//               </div>

//               <div className="col-lg-4 mb-3">
//                 <label>Movie Tickets (₹{MOVIE_PRICE})</label>
//                 <input type="number" className="form-control"
//                   name="movie_show"
//                   value={formData.movie_show}
//                   onChange={handleChange}
//                   min="0"
//                   max={formData.num_of_persons} />
//               </div>

//               <div className="col-lg-4 mb-3">
//                 <label>Discount</label>
//                 <input type="number" className="form-control"
//                   name="discount"
//                   value={formData.discount}
//                   onChange={handleChange} min="0" />
//               </div>

//               <div className="col-lg-6 mb-3">
//                 <div className="form-check form-switch">
//                   <input className="form-check-input"
//                     type="checkbox"
//                     name="gallery"
//                     checked={formData.gallery === '1'}
//                     onChange={handleChange} />
//                   <label>🏛️ Include Museum (₹{GALLERY_PRICE}/person)</label>
//                 </div>
//               </div>

//               <div className="col-lg-6 mb-3">
//                 <label>Total</label>
//                 <div className="form-control bg-dark text-white text-center fw-bold fs-5">
//                   ₹ {formData.total_amt}
//                 </div>
//               </div>
//             </div>

//             {/* PAYMENT */}
//             <h5 className="mt-4 mb-3 border-bottom pb-2">💳 Payment</h5>

//             <div className="row">
//               <div className="col-lg-6 mb-3">
//                 <select className="form-control"
//                   name="payment"
//                   value={formData.payment}
//                   onChange={handleChange}>
//                   <option value="0">Cash</option>
//                   <option value="1">Online</option>
//                 </select>
//               </div>

//               <div className="col-lg-6 mb-3">
//                 <input type="text"
//                   className="form-control"
//                   placeholder="Transaction ID"
//                   name="txn_id"
//                   value={formData.txn_id}
//                   onChange={handleChange} />
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="btn btn-primary w-100 mt-3"
//               disabled={loading}
//             >
//               {loading ? "Processing..." : "Create Entry"}
//             </button>

//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MuseumEntry;



import React, { useEffect, useState } from 'react';
import axios from 'axios';
import swal from 'sweetalert';

const MuseumEntry = () => {
  const [galleryPrice, setGalleryPrice] = useState(50);
  const [moviePrice, setMoviePrice] = useState(30);

  const authStatus = localStorage.getItem('isAuthenticated');
  const role = localStorage.getItem('userRole');
  const [formData, setFormData] = useState({
    firstname: '',
    phone: '',
    address: '',
    num_of_persons: '1',
    total_amt: '50',
    payment: '0',
    gallery: '1', // always 1
   
    movie_show: '0',
    discount: '0',
    txn_id: ''
  });

  const [loading, setLoading] = useState(false);

  // ✅ AUTO CALC
  useEffect(() => {
    const persons = Number(formData.num_of_persons) || 0;
    const movieTickets = Number(formData.movie_show) || 0;
    const discount = Math.max(0, Number(formData.discount) || 0);
    const gPrice = Number(galleryPrice) >= 0 ? Number(galleryPrice) : 0;
    const mPrice = Number(moviePrice) >= 0 ? Number(moviePrice) : 0;

    let total = (persons * gPrice) + (movieTickets * mPrice) - discount;

    setFormData(prev => ({
      ...prev,
      total_amt: total > 0 ? total.toString() : '0'
    }));
  }, [
    formData.num_of_persons,
    formData.movie_show,
    formData.discount,
    galleryPrice,
    moviePrice
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrint = (entry) => {
    const gPrice = Number(galleryPrice) >= 0 ? Number(galleryPrice) : 50;
    const mPrice = Number(moviePrice) >= 0 ? Number(moviePrice) : 30;
    const pCount = Number(entry.num_of_persons) || 1;
    const mCount = Number(entry.movie_show) || 0;
    const dAmt = Number(entry.discount) || 0;
    const entryTotal = pCount * gPrice;
    const movieTotal = mCount * mPrice;

    const qrData = `
Name: ${entry.firstname}
Phone: ${entry.phone}
Date: ${entry.date}
Persons: ${pCount}
Amount: ${entry.total_amt}
`;

    const printWindow = window.open('', '', );

    printWindow.document.write(`
    <html>
      <head>
        <title>Entry Pass</title>
        <style>
          body {
            font-family: monospace;
            width: 300px;
            margin: auto;
            text-align: center;
          }
          .line {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          h3, h4, p {
            margin: 4px 0;
          }
          .bold {
            font-weight: bold;
          }
        </style>
      </head>
      <body>

        <h3>SRI CHAITANYA MAHAPRABHU MUSEUM</h3>
        <p>Visit: chaitanyamuseum.org</p>
        <p>📞 8617528955</p>

        <div class="line"></div>

        <h4>ENTRY PASS</h4>

        <div class="line"></div>

        <p><b>Txn ID :</b> ${entry.txn_id || '-'}</p>
        <p><b>Name :</b> ${entry.firstname}</p>
        <p><b>Phone :</b> ${entry.phone}</p>
        <p><b>Address :</b> ${entry.address}</p>
        <p><b>Date :</b> ${entry.date}</p>
        <p><b>Persons :</b> ${pCount}</p>

        <br/>

        <!-- QR -->
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}" />

        <div class="line"></div>

        <p class="bold">Donation Details</p>

        <p>Entry : ₹${gPrice} x ${pCount} = ₹${entryTotal}</p>

        <p>Movie : ${
          mCount > 0
            ? `${mCount} x ₹${mPrice} = ₹${movieTotal}`
            : "None"
        }</p>

        <p>Discount : ₹${dAmt}</p>

        <div class="line"></div>

        <h3>Total : ₹ ${entry.total_amt}</h3>

        <div class="line"></div>

        <p>[Srivas Angan, Jiva Uddhar, Sankirtan, Philosophy, All Galleries]</p>
        <p>No refunds. Open: 10am–12pm & 3pm–7pm</p>
        <p>Mon Closed</p>

        <p>Thank You. Visit Again!</p>

        <script>
          window.print();
          window.onafterprint = () => window.close();
        </script>

      </body>
    </html>
  `);

    printWindow.document.close();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (Number(formData.movie_show) > Number(formData.num_of_persons)) {
      setLoading(false);
      return swal("Error!", "Movie tickets cannot exceed persons", "error");
    }

    // 🔥 If Online payment → open Razorpay
    if (formData.payment === '1') {
      try {
        const { data: order } = await axios.post(
          'https://chitanya-musium-backend-new-and-latest.onrender.com/api/razorpay/create-order',
          { amount: formData.total_amt }
        );

        const options = {
          key: 'rzp_live_RkF1Uzk5QpuC1K',
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Sri Chaitanya Mahaprabhu Museum',
          description: 'Entry Ticket Payment',
          order_id: order.id,
          prefill: {
            name: formData.firstname || '',
            contact: formData.phone || ''
          },
          handler: async function (response) {
            const updatedData = {
              ...formData,
              payment: '1',
              txn_id: response.razorpay_payment_id
            };

            const res = await axios.post(
              'https://chitanya-musium-backend-new-and-latest.onrender.com/api/museum',
              updatedData
            );

            const entry = res.data;
            swal("Success!", "Payment Successful & Entry Created!", "success").then(() => {
              handlePrint(entry);
            });

            setFormData({
              firstname: '', phone: '', address: '',
              num_of_persons: '1', total_amt: (Number(galleryPrice) || 50).toString(), payment: '0',
              gallery: '1', movie_show: '0', discount: '0', txn_id: ''
            });
          },
          theme: { color: '#3399cc' }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          swal("Payment Failed", response.error?.description || "Payment was not completed", "error");
        });
        rzp.open();
      } catch (err) {
        swal("Error!", err.response?.data?.error || "Payment order creation failed", "error");
      } finally {
        setLoading(false);
      }
      return;
    }

    // 🔥 Cash payment → direct save
    try {
      const res = await axios.post(
        'https://chitanya-musium-backend-new-and-latest.onrender.com/api/museum',
        formData
      );

      const entry = res.data;
      swal("Success!", "Entry Created!", "success").then(() => {
        handlePrint(entry);
      });

      setFormData({
        firstname: '', phone: '', address: '',
        num_of_persons: '1', total_amt: (Number(galleryPrice) || 50).toString(), payment: '0',
        gallery: '1', movie_show: '0', discount: '0', txn_id: ''
      });

    } catch (err) {
      swal("Error!", "Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* 🌟 Header */}
      <div className="text-center mb-4">
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2"
             style={{ background: 'rgba(79, 172, 254, 0.12)', border: '1px solid rgba(79, 172, 254, 0.25)' }}>
          <span className="badge rounded-pill" style={{ background: 'linear-gradient(45deg, #4facfe, #00f2fe)', color: '#fff', fontSize: '10px' }}>POS</span>
          <span className="small fw-bold" style={{ color: '#0284c7' }}>Real-time Entry Pass & Billing Counter</span>
        </div>
        <h2 className="fw-extrabold text-dark tracking-tight mb-1" style={{ fontSize: '1.85rem', letterSpacing: '-0.5px' }}>
          Sri Chaitanya Mahaprabhu Museum
        </h2>
        <p className="text-muted small mb-0">Fast counter ticketing, dynamic rate adjustment & instant pass generation</p>
      </div>

      {/* 💳 Main Card */}
      <div className="card shadow-xl border-0 rounded-4 mx-auto overflow-hidden" 
           style={{ maxWidth: '920px', background: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' }}>
        
        {/* Top subtle accent bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)' }} />

        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit}>

            {/* 👤 VISITOR INFO SECTION */}
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center justify-content-center rounded-circle"
                   style={{ width: '36px', height: '36px', background: 'rgba(79, 172, 254, 0.12)', color: '#0284c7', fontSize: '1.1rem' }}>
                👤
              </div>
              <div>
                <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>Visitor Information</h5>
                <small className="text-muted">Enter primary contact & address</small>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label text-secondary small fw-semibold mb-1">Full Name <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderRadius: '10px 0 0 10px' }}>
                    <i className="fa fa-user" />
                  </span>
                  <input
                    className="form-control form-control-lg border-start-0"
                    style={{ borderRadius: '0 10px 10px 0', fontSize: '0.95rem' }}
                    placeholder="e.g. Rahul Sharma"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label text-secondary small fw-semibold mb-1">Phone Number <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderRadius: '10px 0 0 10px' }}>
                    <i className="fa fa-phone" />
                  </span>
                  <input
                    className="form-control form-control-lg border-start-0"
                    style={{ borderRadius: '0 10px 10px 0', fontSize: '0.95rem' }}
                    placeholder="10-digit mobile number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label text-secondary small fw-semibold mb-1">Address / City <span className="text-danger">*</span></label>
                <textarea
                  className="form-control"
                  rows="2"
                  style={{ borderRadius: '10px', fontSize: '0.95rem' }}
                  placeholder="Visitor's city or residential address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* 🎟️ TICKET ITEMS & BILLING SECTION */}
            <div className="d-flex align-items-center justify-content-between mb-3 pt-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <div className="d-flex align-items-center justify-content-center rounded-circle"
                     style={{ width: '36px', height: '36px', background: 'rgba(67, 233, 123, 0.12)', color: '#16a34a', fontSize: '1.1rem' }}>
                  🎟️
                </div>
                <div>
                  <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>Ticket Selection & Live Rates</h5>
                  <small className="text-muted">Adjust quantity and unit rates directly</small>
                </div>
              </div>
              <span className="badge px-3 py-2 rounded-pill fw-semibold"
                    style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', fontSize: '11px' }}>
                ⚡ Auto Recalculating
              </span>
            </div>

            {/* Itemized Billing Cards */}
            <div className="d-flex flex-column gap-3 mb-4">
              
              {/* Card 1: Museum Entry */}
              <div className="p-3 rounded-4 transition-all"
                   style={{ background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div className="row align-items-center g-3">
                  <div className="col-12 col-md-5 d-flex align-items-center gap-3">
                    <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                         style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: '#fff', fontSize: '1.3rem', borderRadius: '12px' }}>
                      🏛️
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold text-dark">Museum Entry</h6>
                      <small className="text-muted">Standard gallery pass per person</small>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <label className="form-label text-muted small fw-semibold mb-1 d-block">Persons (Qty)</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control form-control-lg text-center fw-bold text-dark"
                        style={{ borderRadius: '10px', background: '#ffffff' }}
                        name="num_of_persons"
                        value={formData.num_of_persons}
                        onChange={handleChange}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="col-6 col-md-2">
                    <label className="form-label text-muted small fw-semibold mb-1 d-block">Rate (₹)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-primary fw-bold" style={{ borderRadius: '10px 0 0 10px', fontSize: '14px' }}>₹</span>
                      <input
                        type="number"
                        className="form-control form-control-lg text-center fw-bold text-primary border-start-0"
                        style={{ borderRadius: '0 10px 10px 0', background: '#ffffff' }}
                        value={galleryPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGalleryPrice(val === '' ? '' : Math.max(0, Number(val)));
                        }}
                        min="0"
                        title="Edit Museum Entry Rate per person"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-2 text-md-end text-center">
                    <label className="form-label text-muted small fw-semibold mb-1 d-block">Subtotal</label>
                    <div className="fw-bolder fs-5 text-primary">
                      ₹{(Number(formData.num_of_persons) || 0) * (Number(galleryPrice) || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Movie Ticket */}
              <div className="p-3 rounded-4 transition-all"
                   style={{ background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div className="row align-items-center g-3">
                  <div className="col-12 col-md-5 d-flex align-items-center gap-3">
                    <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                         style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: '1.3rem', borderRadius: '12px' }}>
                      🎬
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold text-dark">Movie Ticket</h6>
                      <small className="text-muted">3D Audio-visual show pass</small>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <label className="form-label text-muted small fw-semibold mb-1 d-block">Tickets (Qty)</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control form-control-lg text-center fw-bold text-dark"
                        style={{ borderRadius: '10px', background: '#ffffff' }}
                        name="movie_show"
                        value={formData.movie_show}
                        onChange={handleChange}
                        min="0"
                        max={formData.num_of_persons}
                      />
                    </div>
                  </div>

                  <div className="col-6 col-md-2">
                    <label className="form-label text-muted small fw-semibold mb-1 d-block">Rate (₹)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-success fw-bold" style={{ borderRadius: '10px 0 0 10px', fontSize: '14px' }}>₹</span>
                      <input
                        type="number"
                        className="form-control form-control-lg text-center fw-bold text-success border-start-0"
                        style={{ borderRadius: '0 10px 10px 0', background: '#ffffff' }}
                        value={moviePrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMoviePrice(val === '' ? '' : Math.max(0, Number(val)));
                        }}
                        min="0"
                        title="Edit Movie Ticket Rate per ticket"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-2 text-md-end text-center">
                    <label className="form-label text-muted small fw-semibold mb-1 d-block">Subtotal</label>
                    <div className="fw-bolder fs-5 text-success">
                      ₹{(Number(formData.movie_show) || 0) * (Number(moviePrice) || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Special Discount (If Authenticated) */}
              {authStatus && (
                <div className="p-3 rounded-4 transition-all"
                     style={{ background: '#fffbeb', border: '1px dashed #f59e0b', boxShadow: '0 2px 8px rgba(245,158,11,0.05)' }}>
                  <div className="row align-items-center g-3">
                    <div className="col-12 col-md-5 d-flex align-items-center gap-3">
                      <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                           style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontSize: '1.3rem', borderRadius: '12px' }}>
                        🏷️
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold text-dark">Special Concession / Discount</h6>
                        <small className="text-muted">Authorized admin reduction</small>
                      </div>
                    </div>

                    <div className="col-12 col-md-5">
                      <label className="form-label text-muted small fw-semibold mb-1 d-block">Discount Amount (₹)</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 text-danger fw-bold" style={{ borderRadius: '10px 0 0 10px', fontSize: '14px' }}>₹</span>
                        <input
                          type="number"
                          className="form-control form-control-lg fw-bold text-danger border-start-0"
                          style={{ borderRadius: '0 10px 10px 0', background: '#ffffff' }}
                          name="discount"
                          value={formData.discount}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val < 0) return;
                            handleChange(e);
                          }}
                          min="0"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-2 text-md-end text-center">
                      <label className="form-label text-muted small fw-semibold mb-1 d-block">Deduction</label>
                      <div className="fw-bolder fs-5 text-danger">
                        - ₹{Number(formData.discount) || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* 💰 PREMIUM INVOICE GRAND TOTAL CARD */}
            <div className="p-4 mb-4 rounded-4 text-white position-relative overflow-hidden shadow-lg"
                 style={{
                   background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
                   border: '1px solid rgba(255, 255, 255, 0.1)'
                 }}>
              
              {/* Background ambient glow effect */}
              <div style={{
                position: 'absolute',
                top: '-40%',
                right: '-10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(79, 172, 254, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
                pointerEvents: 'none'
              }} />

              <div className="row align-items-center position-relative g-3">
                <div className="col-12 col-md-7">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-white bg-opacity-10 text-light px-2 py-1 rounded-pill small border border-white border-opacity-10">
                      🧾 Live Invoice Summary
                    </span>
                  </div>
                  <div className="text-white-50 small mb-1">
                    Museum: <span className="text-white fw-semibold">{Number(formData.num_of_persons) || 0} × ₹{Number(galleryPrice) || 0}</span>
                    <span className="mx-2">•</span>
                    Movie: <span className="text-white fw-semibold">{Number(formData.movie_show) || 0} × ₹{Number(moviePrice) || 0}</span>
                    {Number(formData.discount) > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        Discount: <span className="text-warning fw-semibold">- ₹{formData.discount}</span>
                      </>
                    )}
                  </div>
                  <small className="text-white-50" style={{ fontSize: '11px' }}>
                    Instant QR ticket generated upon confirmation
                  </small>
                </div>

                <div className="col-12 col-md-5 text-md-end">
                  <span className="text-white-50 small text-uppercase fw-semibold d-block" style={{ letterSpacing: '1px', fontSize: '11px' }}>
                    Total Payable Amount
                  </span>
                  <div className="d-flex align-items-center justify-content-md-end gap-1 my-1">
                    <span className="fs-3 fw-bold text-warning">₹</span>
                    <span className="display-6 fw-extrabold text-white" style={{ letterSpacing: '-1px', fontWeight: '800' }}>
                      {formData.total_amt}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 💳 PAYMENT METHOD SWITCHER */}
            <div className="d-flex align-items-center gap-2 mb-3 pt-2 pb-2 border-bottom">
              <div className="d-flex align-items-center justify-content-center rounded-circle"
                   style={{ width: '36px', height: '36px', background: 'rgba(147, 51, 234, 0.12)', color: '#9333ea', fontSize: '1.1rem' }}>
                💳
              </div>
              <div>
                <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>Payment Mode</h5>
                <small className="text-muted">Select collection channel</small>
              </div>
            </div>

            <div className="row g-3 mb-4">
              {/* Cash Selector Card */}
              <div className="col-md-6">
                <div 
                  onClick={() => setFormData(prev => ({ ...prev, payment: '0' }))}
                  className={`p-3 rounded-4 cursor-pointer d-flex align-items-center justify-content-between transition-all ${formData.payment === '0' ? 'bg-primary-subtle border-primary' : 'bg-light border-transparent'}`}
                  style={{
                    border: formData.payment === '0' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="fs-2">💵</div>
                    <div>
                      <div className="fw-bold text-dark">Cash Payment</div>
                      <small className="text-muted">Instant pass generation</small>
                    </div>
                  </div>
                  <input
                    type="radio"
                    className="form-check-input"
                    checked={formData.payment === '0'}
                    onChange={() => setFormData(prev => ({ ...prev, payment: '0' }))}
                  />
                </div>
              </div>

              {/* Online Selector Card */}
              <div className="col-md-6">
                <div 
                  onClick={() => setFormData(prev => ({ ...prev, payment: '1' }))}
                  className={`p-3 rounded-4 cursor-pointer d-flex align-items-center justify-content-between transition-all ${formData.payment === '1' ? 'bg-primary-subtle border-primary' : 'bg-light border-transparent'}`}
                  style={{
                    border: formData.payment === '1' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="fs-2">⚡</div>
                    <div>
                      <div className="fw-bold text-dark">Online Gateway</div>
                      <small className="text-muted">Razorpay / UPI / QR</small>
                    </div>
                  </div>
                  <input
                    type="radio"
                    className="form-check-input"
                    checked={formData.payment === '1'}
                    onChange={() => setFormData(prev => ({ ...prev, payment: '1' }))}
                  />
                </div>
              </div>

              {/* Optional Txn ID Input */}
              <div className="col-12">
                <label className="form-label text-secondary small fw-semibold mb-1">
                  Transaction / Memo ID <span className="text-muted fw-normal">(Optional)</span>
                </label>
                <input
                  className="form-control form-control-lg"
                  style={{ borderRadius: '10px', fontSize: '0.95rem' }}
                  placeholder="e.g. UPI Ref Number or Cash Counter Slip No."
                  name="txn_id"
                  value={formData.txn_id}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 🚀 SUBMIT CTA BUTTON */}
            <button
              type="submit"
              className="btn btn-lg w-100 text-white fw-bold py-3 rounded-4 shadow-lg position-relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0284c7 0%, #00f2fe 100%)",
                border: "none",
                fontSize: "1.15rem",
                letterSpacing: "0.2px",
                boxShadow: "0 15px 30px -5px rgba(2, 132, 199, 0.4)",
                transition: "all 0.3s ease"
              }}
              disabled={loading}
            >
              {loading ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  Generating Entry Pass...
                </span>
              ) : (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span>Confirm & Print Entry Pass</span>
                  <span className="badge bg-white text-dark rounded-pill px-3 py-1 fw-extrabold ms-2" style={{ fontSize: '13px' }}>
                    ₹ {formData.total_amt}
                  </span>
                </span>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default MuseumEntry;