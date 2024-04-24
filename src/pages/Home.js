import { collection, deleteDoc, doc, getDocs, limit, onSnapshot, orderBy, query, startAfter, where } from 'firebase/firestore';
import React,{useState,useEffect} from 'react';
import { db } from '../firebase';
import BlogSection from '../components/BlogSection';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import Tags from '../components/Tags';
import MostPopular from '../components/MostPopular';
import Trending from '../components/Trending';
import Search from '../components/Search';
import { isEmpty, isNull } from "lodash";
import { useLocation } from 'react-router-dom';

function useQuery(){
   return new URLSearchParams(useLocation().search);
}

const Home = ({setActive , user,active}) => {
  const [loading,setLoading] = useState(true);
  const [blogs,setBlogs] = useState([]);
  const [tags,setTags] = useState([]);
  const [lastVisible,setLastVisible] = useState(null);
  const [hide , setHide] = useState(false);
  const [search,setSearch] = useState("");
  const [trendBlogs , setTrendBlogs] = useState([]);
  const queryString = useQuery();
  const serachQuery = queryString.get("searchQuery");
  const location = useLocation();

  const getTrendingBlogs = async () => {
       const blogRef = collection(db,"blogs");
       const trendQuery = query(blogRef , where("trending" , "==" , "yes"));
       const querySnapshot = await getDocs(trendQuery);
       let trendBlogs = [];
       querySnapshot.forEach((doc) => {
            trendBlogs.push({id: doc.id , ...doc.data() });
       });
       setTrendBlogs(trendBlogs);
  };

  useEffect(() => {
     getTrendingBlogs();
     setSearch("");

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
      //   setBlogs(list);
        setLoading(false);
        setActive("home");
      },
      (error) => {
        console.log(error);
      }
     );

     return () => {
         unsub();
         getTrendingBlogs();
     }; 
  },[setActive,active]);
  
  const getBlogs = async () => {
     const blogRef = collection(db,"blogs");
     // const blogQuery = query(blogRef ,orderBy("title"));
     const firstFour = query(blogRef,orderBy("title"),limit(4));
     const docSnapshot =  await getDocs(firstFour);
     setBlogs(docSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data()})));
     setLastVisible(docSnapshot.docs[docSnapshot.docs.length - 1]);
  };
  useEffect(() => {
     getBlogs();
     setHide(false);
  },[active]);
   
  const updateState = (docSnapshot) => {
     const isCollectionEmpty = docSnapshot.size === 0;
     if(!isCollectionEmpty){
        const blogData = docSnapshot.docs.map((doc) => ({id: doc.id , ...doc.data()}));
        setBlogs((blogs) => [...blogs , ...blogData]);
        setLastVisible(docSnapshot.docs[docSnapshot.docs.length - 1]);
     }else{
       toast.info("No more blogs !!");
       setHide(true);
     }
  };
  
  const fetchMore = async () => {
     setLoading(true);
     const blogRef = collection(db,"blogs");
     const nextFour = query(blogRef,orderBy("title"),limit(4),startAfter(lastVisible));
     const docSnapshot = await getDocs(nextFour);
     updateState(docSnapshot);
     setLoading(false);
  };
  
  
  useEffect(() => {
     if(!isNull(serachQuery)){
        searchBlogs();
     }
  },[serachQuery]);


  const searchBlogs = async () => {
     const blogRef = collection(db,"blogs");
     const searchTitleQuery = query(blogRef , where("title" ,"==" ,serachQuery));
     const searchTagQuery = query(blogRef , where("tags" ,"array-contains" ,serachQuery));
     const titleSnapshot = await getDocs(searchTitleQuery);
     const tagSnapshot = await getDocs(searchTagQuery);
     let searchTitleBlogs = [];
     let searchTagBlogs = [];

     titleSnapshot.forEach((doc) => {
        searchTitleBlogs.push({id: doc.id, ...doc.data()});
      });
     tagSnapshot.forEach((doc) => {
        searchTagBlogs.push({id: doc.id, ...doc.data()});
     });
     const combinedSearchBlogs = searchTitleBlogs.concat(searchTagBlogs);
     setBlogs(combinedSearchBlogs);
     setHide(true);
     setActive("");
  };

  if(loading){
   return <Spinner/>;
  }

  const handleDelete = async (id) => {
      if(window.confirm("Are you sure to delete this blog ?")){
         try {
            setLoading(true);
            toast.success("Blog deleted successfully !!");
            await deleteDoc(doc(db,"blogs" ,id));
            setLoading(false);
         } catch (error) {
            console.log(error);
         }
      }
  };

const handleChange = (e) => {
   const {value} = e.target;
   if(isEmpty(value)){
      getBlogs();
      setHide(false);
   }
   setSearch(value);
};

  return (
     <div className="container-fluid pb-4 pt-4 padding">
        <div className="container padding">
            <div className="row mx-0">
               <Trending blogs={trendBlogs}/>
               <div className="col-md-8">
                  <div className="blog-heading text-start py-2 mb-4">Daily Blogs</div>
                  {blogs.length === 0 && location.pathname !== "/" && (
                     <>
                       <h4>No Blogs avaiable with <strong>{serachQuery}</strong> .</h4>
                     </>
                  )}
                   <BlogSection blogs={blogs} user={user} handleDelete = {handleDelete}/>
                   {!hide &&  <button className="btn btn-primary" onClick={fetchMore}>Load more</button>}
                  
               </div>
               <div className="col-md-3">
                  <Search search={search} handleChange={handleChange}/>
                 <Tags tags={tags}/>
                 <MostPopular blogs={blogs}/>
               </div>
            </div>
        </div>
     </div>
  )
}

export default Home