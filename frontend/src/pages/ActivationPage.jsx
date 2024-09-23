import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

const ActivationPage = () => {
  const token = new URLSearchParams(window.location.search).get("token");
  const [status, setStatus] = useState("loading");

  // Define the mutation function using useMutation from react-query
  const { mutate: activateUser, isLoading } = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/auth/activation", {
        activation_token: token,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setStatus("success");
        toast.success("Account activated successfully!");
      } else {
        setStatus("error");
        toast.error("Activation failed. Please try again.");
      }
    },
    onError: () => {
      setStatus("error");
      toast.error("An error occurred while activating your account.");
    },
  });

  useEffect(() => {
    if (token) {
      activateUser();
    }
  }, [token, activateUser]);

  const renderMessage = () => {
    if (isLoading) return <p>Activating your account...</p>;

    switch (status) {
      case "success":
        return <p>Your account has been created successfully!</p>;
      case "error":
        return (
          <p>
            There was an error with your activation token. Please try again.
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {renderMessage()}
    </div>
  );
};

export default ActivationPage;
