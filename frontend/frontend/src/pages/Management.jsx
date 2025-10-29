import React, { useState, useEffect } from "react";
import {
  SearchBar,
  Grid,
  Card,
  Tag,
  Button,
  Rate,
  Toast,
  Avatar,
  Badge,
  Space,
  DotLoading,
  Empty,
  Popup,
  List,
  Modal,
  Ellipsis,
  Selector,
  Slider,
} from "antd-mobile";
import {
 
  EnvironmentOutline,
 
  CloseOutline,
 
} from "antd-mobile-icons";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/auth";
import HeaderWithSearch from "../components/common/HeaderWithSearch";

const Settings = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState("Surat");
  const [currentUser, setCurrentUser] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [locationVisible, setLocationVisible] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    propertyType: [],
    minRating: 0,
    priceRange: [0, 50000000],
  });

  // Available locations
  const availableLocations = [
    "Surat City Center",
    "Adajan", 
    "Varachha",
    "Athwa",
    "Vesu",
    "Piplod",
    "Rander",
    "Pal",
    "Althan",
    "Katargam",
    "Udhna",
    "Sarthana"
  ];

  // Property type options
  const propertyTypeOptions = [
    { label: 'Apartment', value: 'Apartment' },
    { label: 'Villa', value: 'Villa' },
    { label: 'House', value: 'House' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Plot', value: 'Plot' },
  ];

  // Advertisements data
  const advertisements = [
    {
      id: 1,
      title: "Premium Properties",
      description: "Exclusive luxury properties with premium amenities",
      badge: "Luxury",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: 2,
      title: "Smart Home Solutions",
      description: "Modern smart home technologies and automation",
      badge: "Smart",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      id: 3,
      title: "Property Management",
      description: "Professional management services for your properties",
      badge: "Management",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    }
  ];

  // Demo Property Data (20 properties) - same as before
  const demoProperties = [
    // ... (same as your existing demoProperties array)
    {
      id: 1,
      title: "Luxury Apartment in City Center",
      type: "Apartment",
      location: "Surat City Center",
      price: 8500000,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
      bedrooms: 3,
      bathrooms: 2,
      area: 1250,
      features: ["Swimming Pool", "Gym", "Parking", "Security"],
      status: "Active"
    },
    {
      id: 2,
      title: "Modern Villa with Garden",
      type: "Villa",
      location: "Adajan, Surat",
      price: 12500000,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop",
      bedrooms: 4,
      bathrooms: 3,
      area: 2200,
      features: ["Garden", "Parking", "Security", "Modular Kitchen"],
      status: "Active"
    },{
      id: 3,
      title: "Modern Villa with Garden",
      type: "Villa",
      location: "goa",
      price: 12500000,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop",
      bedrooms: 4,
      bathrooms: 3,
      area: 2200,
      features: ["Garden", "Parking", "Security", "Modular Kitchen"],
      status: "Active"
    },{
      id: 4,
      title: "Modern Villa with Garden",
      type: "Villa",
      location: "pune",
      price: 12500000,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop",
      bedrooms: 4,
      bathrooms: 3,
      area: 2200,
      features: ["Garden", "Parking", "Security", "Modular Kitchen"],
      status: "Active"
    },{
      id: 5,
      title: "Modern Villa with Garden",
      type: "Villa",
      location: "pune",
      price: 12500000,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop",
      bedrooms: 4,
      bathrooms: 3,
      area: 2200,
      features: ["Garden", "Parking", "Security", "Modular Kitchen"],
      status: "Active"
    },
    {
      id: 6,
      title: "Modern Villa with Garden",
      type: "Villa",
      location: "pune",
      price: 12500000,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop",
      bedrooms: 4,
      bathrooms: 3,
      area: 2200,
      features: ["Garden", "Parking", "Security", "Modular Kitchen"],
      status: "Active"
    },
    {
      id: 7,
      title: "Modern Villa with Garden",
      type: "Villa",
      location: "goa",
      price: 12500000,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop",
      bedrooms: 4,
      bathrooms: 3,
      area: 2200,
      features: ["Garden", "Parking", "Security", "Modular Kitchen"],
      status: "Active"
    },{
      id: 8,
      title: "Modern Villa with Garden",
      type: "Villa",
      location: "pune",
      price: 12500000,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop",
      bedrooms: 4,
      bathrooms: 3,
      area: 2200,
      features: ["Garden", "Parking", "Security", "Modular Kitchen"],
      status: "Active"
    },{
      id: 9,
      title: "Modern Villa with Garden",
      type: "Villa",
      location: "pune",
      price: 12500000,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop",
      bedrooms: 4,
      bathrooms: 3,
      area: 2200,
      features: ["Garden", "Parking", "Security", "Modular Kitchen"],
      status: "Active"
    },
    // ... (include all your existing properties)
  ];

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const res = await getProfile();
        if (res.success) {
          setCurrentUser(res.data.user);
        }
      }
    } catch (error) {
      console.log("Error fetching user profile");
    }
  };

  // Load demo data
  const loadProperties = () => {
    setLoading(true);
    setTimeout(() => {
      setProperties(demoProperties);
      setFilteredProperties(demoProperties);
      setLoading(false);
    }, 1000);
  };

  // Apply filters and search
  const applyFiltersAndSearch = () => {
    let filtered = [...demoProperties];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply property type filter
    if (filters.propertyType.length > 0) {
      filtered = filtered.filter(property =>
        filters.propertyType.includes(property.type)
      );
    }

    // Apply rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(property => 
        property.rating >= filters.minRating
      );
    }

    // Apply price range filter
    filtered = filtered.filter(property =>
      property.price >= filters.priceRange[0] && property.price <= filters.priceRange[1]
    );

    setFilteredProperties(filtered);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Handle location change
  const handleLocationChange = (location) => {
    setUserLocation(location);
    setLocationVisible(false);
    Toast.show(`Location changed to ${location}`);
  };

  // Format price
  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  // Get properties in chunks of 9
  const getPropertyChunks = () => {
    const chunks = [];
    for (let i = 0; i < filteredProperties.length; i += 9) {
      chunks.push(filteredProperties.slice(i, i + 9));
    }
    return chunks;
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      propertyType: [],
      minRating: 0,
      priceRange: [0, 50000000],
    });
  };

  // Apply filters
  const handleApplyFilters = () => {
    applyFiltersAndSearch();
    setFilterVisible(false);
    Toast.show('Filters applied');
  };

 

        


  // Filter Modal Component
  const FilterModal = () => (
    <Modal
      visible={filterVisible}
      onClose={() => setFilterVisible(false)}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: '600' }}>Filter Properties</span>
          <Button fill="none" size="small" onClick={() => setFilterVisible(false)}>
            <CloseOutline />
          </Button>
        </div>
      }
      content={
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '8px' }}>Property Type</h4>
            <Selector
              options={propertyTypeOptions}
              value={filters.propertyType}
              onChange={value => setFilters(prev => ({ ...prev, propertyType: value }))}
              multiple
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '8px' }}>Minimum Rating</h4>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#1677ff' }}>{filters.minRating}+ Stars</span>
            </div>
            <Slider
              min={0}
              max={5}
              value={filters.minRating}
              onChange={value => setFilters(prev => ({ ...prev, minRating: value }))}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '8px' }}>Price Range</h4>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#1677ff' }}>
                {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              </span>
            </div>
            <Slider
              range
              min={0}
              max={50000000}
              value={filters.priceRange}
              onChange={value => setFilters(prev => ({ ...prev, priceRange: value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button color="default" onClick={resetFilters} style={{ flex: 1 }}>
              Reset
            </Button>
            <Button color="primary" onClick={handleApplyFilters} style={{ flex: 1 }}>
              Apply
            </Button>
          </div>
        </div>
      }
    />
  );

  // Property Detail Modal
  const PropertyModal = () => (
    <Modal
      visible={!!selectedProperty}
      onClose={() => setSelectedProperty(null)}
      closeOnAction
      closeOnMaskClick
      actions={[
        {
          key: 'close',
          text: 'Close',
          primary: true,
        }
      ]}
      content={
        selectedProperty && (
          <div style={{ padding: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img
                src={selectedProperty.image}
                alt={selectedProperty.title}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  marginBottom: '12px'
                }}
              />
              <h2 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{selectedProperty.title}</h2>
              <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{selectedProperty.type}</p>
              <Rate
                readOnly
                value={selectedProperty.rating || 0}
                style={{ margin: '8px 0' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Property Details</h4>
              <List style={{ '--font-size': '13px' }}>
                <List.Item prefix={<EnvironmentOutline />}>
                  {selectedProperty.location}
                </List.Item>
                <List.Item>
                  Price: {formatPrice(selectedProperty.price)}
                </List.Item>
                <List.Item>
                  {selectedProperty.bedrooms} BHK • {selectedProperty.bathrooms} Bath • {selectedProperty.area} sq.ft
                </List.Item>
                <List.Item>
                  Status: <Tag color="green" size="small">{selectedProperty.status}</Tag>
                </List.Item>
              </List>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Features</h4>
              <Space wrap>
                {selectedProperty.features.map((feature, index) => (
                  <Tag key={index} color="blue" fill="outline" style={{ fontSize: '12px' }}>
                    {feature}
                  </Tag>
                ))}
              </Space>
            </div>

            <Space block>
              <Button color="primary" fill="solid" block size="large">
                Edit Property
              </Button>
            </Space>
          </div>
        )
      }
    />
  );

  useEffect(() => {
    loadProperties();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchQuery, filters]);

  const propertyChunks = getPropertyChunks();

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh',
      backgroundImage: 'url("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Dark Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 0
      }}></div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
       <HeaderWithSearch
  searchValue={searchQuery}
  setSearchValue={setSearchQuery}
  city={userLocation}
  setCity={setUserLocation}
/>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            color: 'white'
          }}>
            <DotLoading color="primary" />
            <div style={{ marginTop: '12px', color: 'white' }}>Loading properties...</div>
          </div>
        ) : (
          <div style={{ padding: '12px', paddingBottom: '80px' }}>
            {filteredProperties.length === 0 ? (
              <Empty description="No properties found" />
            ) : (
              propertyChunks.map((chunk, chunkIndex) => (
                <div key={chunkIndex}>
                  {/* 3x3 Grid */}
                  <Grid columns={3} gap={8} style={{ marginBottom: '16px' }}>
                    {chunk.map((property) => (
                      <Grid.Item key={property.id}>
                        <Card
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            padding: '8px'
                          }}
                        >
                          <div style={{ textAlign: 'center' }}>
                            <img
                              src={property.image}
                              alt={property.title}
                              style={{
                                width: '100%',
                                height: '70px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                marginBottom: '6px'
                              }}
                            />
                            <div style={{
                              fontWeight: '600',
                              fontSize: '11px',
                              color: 'white',
                              marginBottom: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {property.title}
                            </div>
                            <div style={{
                              fontSize: '9px',
                              color: 'rgba(255, 255, 255, 0.8)',
                              marginBottom: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {property.type}
                            </div>
                            <Rate
                              readOnly
                              value={property.rating || 0}
                              style={{ '--star-size': '10px', marginBottom: '4px' }}
                            />
                            <div style={{
                              fontSize: '9px',
                              color: 'rgba(255, 255, 255, 0.9)',
                              marginBottom: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '2px'
                            }}>
                              <EnvironmentOutline style={{ fontSize: '8px' }} />
                              <Ellipsis content={property.location} row={1} />
                            </div>
                            <div style={{
                              fontSize: '9px',
                              color: 'rgba(255, 255, 255, 1)',
                              marginBottom: '4px'
                            }}>
                              {property.bedrooms} BHK • {property.area} sq.ft
                            </div>
                            <div style={{
                              fontSize: '10px',
                              color: '#1677ff',
                              fontWeight: '600',
                              marginBottom: '6px'
                            }}>
                              {formatPrice(property.price)}
                            </div>
                            <Button
                              size="mini"
                              color="primary"
                              fill="solid"
                              style={{ fontSize: '10px', height: '24px' }}
                              onClick={() => setSelectedProperty(property)}
                            >
                              View
                            </Button>
                          </div>
                        </Card>
                      </Grid.Item>
                    ))}
                  </Grid>

                  {/* Advertisement after each chunk */}
                  {advertisements[chunkIndex] && (
                    <Card
                      style={{
                        background: advertisements[chunkIndex].gradient,
                        color: 'white',
                        marginBottom: '16px',
                        border: 'none',
                        borderRadius: '12px'
                      }}
                    >
                      <div style={{ padding: '16px', textAlign: 'center' }}>
                        <Badge
                          content={advertisements[chunkIndex].badge}
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.65)', 
                            color: 'white',
                            fontSize: '10px'
                          }}
                        />
                        <h3 style={{ 
                          margin: '8px 0 4px 0', 
                          color: 'white',
                          fontSize: '14px'
                        }}>
                          {advertisements[chunkIndex].title}
                        </h3>
                        <p style={{ 
                          margin: '0 0 12px 0', 
                          opacity: 0.9,
                          fontSize: '12px'
                        }}>
                          {advertisements[chunkIndex].description}
                        </p>
                        <Button 
                          color="primary" 
                          size="small" 
                          fill="solid"
                          style={{ fontSize: '12px' }}
                        >
                          Explore
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals and Popups */}
      <FilterModal />
      <PropertyModal />
      
    </div>
  );
};

export default Settings;