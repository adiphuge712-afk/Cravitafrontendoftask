import React from 'react'
import academyimg1 from "../assets/img1.jpg";
import academyimg2 from "../assets/img2.jpg";
import academyimg3 from "../assets/img3.jpg";

const Home = () => {
  
  return (
    <>
      {/* <div className='vh-100  bg-info '>Home</div>
 
     */}

      <main className='bg-secondary'>
        {/* Carousel */}
        <div id="myCarousel" className="carousel slide vh-100 " data-bs-ride="carousel">
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="0" className="active"></button>
            <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="1"></button>
            <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="2"></button>
          </div>

          <div className="carousel-inner">

            <div className="carousel-item active">
              <div className="d-flex justify-content-center align-items-center bg-secondary"
                style={{
                  backgroundImage: `url(${academyimg1})`,
                  height: "100vh",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}>
                <div className="text-white text-center">
                  <h1>Example headline</h1>
                  <p>First slide content</p>
                  <button className="btn btn-primary">Sign up today</button>
                </div>
              </div>
            </div>

            <div className="carousel-item">
              <div className="d-flex justify-content-center align-items-center bg-danger"
                style={{
                  backgroundImage: `url(${academyimg2})`,
                  height: "100vh",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}>
                <div className="text-white text-center">
                  <h1>Another headline</h1>
                  <p>Second slide content</p>
                  <button className="btn btn-primary">Learn more</button>
                </div>
              </div>
            </div>

            <div className="carousel-item">
              <div className="d-flex justify-content-center align-items-center bg-primary"
                style={{
                  backgroundImage: `url(${academyimg3})`,
                  height: "100vh",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}>
                <div className="text-white text-center">
                  <h1>One more slide</h1>
                  <p>Third slide content</p>
                  <button className="btn btn-light">Browse gallery</button>
                </div>
              </div>
            </div>

          </div>

          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#myCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon"></span>
          </button>

          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#myCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon"></span>
          </button>
        </div>

        {/* Marketing Section */}
        <div className="container-fliud marketing mt-1 p-3 bg-dark text-light">
          <div className="row text-center ">
            <div className="col-lg-4">
              <h2>Expert Faculty</h2>
              <p>Learn from highly qualified and industry-experienced instructors
                who are dedicated to helping you build strong fundamentals
                and real-world skills.</p>
              <button className="btn btn-secondary">View details</button>
            </div>

            <div className="col-lg-4">
              <h2>Practical Training</h2>
              <p>Gain hands-on experience through live projects, coding sessions,
                and real-time problem solving to prepare yourself for
                industry challenges.</p>
              <button className="btn btn-secondary">View details</button>
            </div>

            <div className="col-lg-4 ">
              <h2>Career Support</h2>
              <p>We provide resume building, mock interviews, and placement
                assistance to help you confidently step into the IT industry.</p>
              <button className="btn btn-secondary">View details</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="container-fluid mt-1 bg-dark p-2 text-white">
          <p className="float-end ">
            <a href="#" className='border rounded p-1 ' style={{ textDecoration: "none", color: "white" }}>Back to top</a>
          </p>
          <p>© 2026 Aayush Academy and pvt.limited, Inc.</p>
        </footer>
      </main>



    </>
  )
}

export default Home