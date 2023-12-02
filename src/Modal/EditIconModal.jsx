import React, { useState } from "react";
import { Form, Input, Modal } from "antd";
// import { storage, db } from "../DataBase/firebase";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { collection, addDoc } from "firebase/firestore";
// import { FileImageOutlined } from "@ant-design/icons";

const EditIconModal = ({ visible, onClose, onIconChange }) => {
  const [linkToPictures, setLinkToPictures] = useState("");
  // const [file, setFile] = useState(null);

  // const handleImageChange = (e) => {
  //   const selectedFile = e.target.files[0];
  //   if (selectedFile) {
  //     setFile(URL.createObjectURL(selectedFile)); // Получаем URL выбранного изображения
  //     setLinkToPictures("");
  //   }
  // };

  // const handleUpload = () => {
  //   if (image) {
  //     const storageRef = ref(storage, `images/${image.name}`);
  //     uploadBytes(storageRef, image).then((snapshot) => {
  //       getDownloadURL(snapshot.ref).then((downloadURL) => {
  //         setImageUrl(downloadURL); // Получаем URL загруженного изображения

  //         // Сохраняем ссылку в базе данных Firestore
  //         const imagesCollectionRef = collection(db, "images");
  //         addDoc(imagesCollectionRef, { imageUrl: downloadURL })
  //           .then((docRef) => {
  //             console.log("Document written with ID: ", docRef.id);
  //           })
  //           .catch((error) => {
  //             console.error("Error adding document: ", error);
  //           });
  //       });
  //     });
  //   }
  // };

  const editTheUserImage = () => {
    onIconChange(linkToPictures);
    // if (file) {
    //   onIconChange(file);
    // }
    onClose();
  };

  return (
    <Modal
      title="Edit Icon"
      open={visible}
      onCancel={onClose}
      onOk={editTheUserImage}
    >
      <Form
        name="edit-icon-form"
        labelCol={{
          span: 100,
        }}
        wrapperCol={{
          span: 100,
        }}
        style={{
          maxWidth: 1000,
        }}
        onFinish={editTheUserImage}
        autoComplete="off"
        className="edit-icon-form"
      >
        <Form.Item
          className="edit-modal-form-input"
          label="Image URL"
          name="userIcon"
        >
          <Input
            placeholder="Image URL"
            value={linkToPictures}
            onChange={(e) => setLinkToPictures(e.target.value)}
          />
        </Form.Item>
        {/* <Form.Item
          className="edit-modal-form-input-file"
          label="Or use File"
          name="userFile"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="upload"
          />
          <label htmlFor="upload">
            {
              <FileImageOutlined
                style={{ fontSize: "25px", cursor: "pointer" }}
              />
            }
          </label>
          {file && (
            <div
              style={{
                width: "300px",
                marginTop: "10px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                src={linkToPictures || file}
                alt="selected"
                style={{
                  width: "300px",
                  height: "300px",
                  borderRadius: `0%`,
                }}
              />
            </div>
          )}
        </Form.Item> */}
      </Form>
    </Modal>
  );
};

export default EditIconModal;
