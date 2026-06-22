import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

export const useYupForm = (schema, defaultValues = {}) => {
  return useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onChange",
  });
};
