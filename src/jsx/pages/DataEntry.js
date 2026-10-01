import React, { useState } from 'react';

function DataEntry() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    image: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Data Entry:', formData);
    alert('Data saved successfully!');
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      date: '',
      image: null
    });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Museum Data Entry</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label><strong>Title</strong></label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter title"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label><strong>Category</strong></label>
                      <select
                        name="category"
                        className="form-control"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="artifact">Artifact</option>
                        <option value="painting">Painting</option>
                        <option value="sculpture">Sculpture</option>
                        <option value="historical">Historical Item</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label><strong>Date</strong></label>
                      <input
                        type="date"
                        name="date"
                        className="form-control"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label><strong>Image</strong></label>
                      <input
                        type="file"
                        name="image"
                        className="form-control"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <div className="form-group mb-3">
                      <label><strong>Description</strong></label>
                      <textarea
                        name="description"
                        className="form-control"
                        rows="4"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter description"
                        required
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary">
                      Save Data
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataEntry;