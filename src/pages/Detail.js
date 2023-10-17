import React,{useState,useEffect} from 'react';
import { useParams } from 'react-router-dom';
import {doc,getDoc,onSnapshot,collection} from 'firebase/firestore';
import {db} from '../firebase';
import Tags from '../components/Tags';
import MostPopular from '../components/MostPopular';


const Detail = ({setActive}) => {
  const [blog,setBlog] = useState(null);
   const [blogs,setBlogs] = useState([]);
  const [tags,setTags] = useState([]);
  const {id} = useParams();

  useEffect(() => {
    //  getTrendingBlogs();
     const unsub = onSnapshot(
      collection(db,"blogs"),
      (snapshot) => {
        let list = [];
        let tags = [];
        snapshot.docs.forEach((doc) => {
           tags.push(...doc.get("tags"));
           list.push({id: doc.id , ...doc.data()});
        });
        const uniqueTags = [...new Set(tags)];
        setTags(uniqueTags);
        setBlogs(list);
        setActive("home");
      },
      (error) => {
        console.log(error);
      }
     );

     return () => {
         unsub();
        //  getTrendingBlogs();
     }; 
  },[]);

  useEffect(() => {
     id && getBlogDetails();
     // eslint-disable-next-line react-hooks/exhaustive-deps 
  },[id])

  const getBlogDetails =  async () => {
      const docRef = doc(db,"blogs",id);
      const blogDetail = await getDoc(docRef);
      setBlog(blogDetail.data());
      setActive(null);
  };

  return (
     <div className="single">
      <div className="blog-title-box"
           style={{ backgroundImage : `url('${blog?.imgUrl}')` }}
      >
      <div className="overlay"></div>
        <div className="blog-title">
          <span>{blog?.timeStamps.toDate().toDateString()}</span>
          <h2>{blog?.title}</h2>
        </div>
      </div>
      <div className="container-fluid pb-4 pt-4 padding blog-single content">
          <div className="container padding">
             <div className="row mx-0">
              <div className="col-md-8">
                  <span className="meta-info text-start">
                     By <p className="author">{blog?.author}</p> -&nbsp;
                     {blog?.timeStamps.toDate().toDateString()}
                  </span>
                  <p className="text-start">{blog?.description}</p>
              </div>
              {/* <div className="col-md-3">
                <h2>Tags</h2>
                <h2>Most Popular</h2>
              </div> */}
              <div className="col-md-3">
                 <Tags tags={tags}/>
                 <MostPopular blogs={blogs}/>
               </div>
             </div>
          </div>
      </div>
     </div>
  )
}

export default Detail