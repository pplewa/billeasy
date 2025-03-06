import { z } from "zod";

// Get Google Maps API key from environment variables - use the server-side key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

// Validation schema for autocomplete request
export const autocompleteRequestSchema = z.object({
  input: z.string().min(1).max(500),
  types: z.array(z.string()).optional(),
});

// Validation schema for place details request
export const placeDetailsRequestSchema = z.object({
  placeId: z.string().min(1).max(500),
});

// Type definitions
export type AutocompleteRequest = z.infer<typeof autocompleteRequestSchema>;
export type PlaceDetailsRequest = z.infer<typeof placeDetailsRequestSchema>;

export interface AddressSuggestion {
  placeId: string;
  description: string;
}

export interface AddressDetails {
  address: string;
  city: string;
  zipCode: string;
  country: string;
}

// Define Google Maps API response types
interface GooglePlacesPrediction {
  place_id: string;
  description: string;
}

interface GooglePlacesAutoCompleteResponse {
  predictions: GooglePlacesPrediction[];
  status: string;
  error_message?: string;
}

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GooglePlaceDetailsResult {
  formatted_address?: string;
  address_components?: GoogleAddressComponent[];
}

interface GooglePlaceDetailsResponse {
  result: GooglePlaceDetailsResult;
  status: string;
  error_message?: string;
}

/**
 * Get address suggestions from Google Maps Places API
 */
export async function getAddressSuggestions({
  input,
  types = ["address"],
}: AutocompleteRequest): Promise<AddressSuggestion[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  console.log({ GOOGLE_MAPS_API_KEY })

  try {
    const params = new URLSearchParams({
      input,
      types: types.join("|"),
      key: GOOGLE_MAPS_API_KEY,
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google Maps API error: ${errorData.error_message || response.statusText}`);
    }

    const data = await response.json() as GooglePlacesAutoCompleteResponse;

    // Handle API error responses
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Maps API error: ${data.error_message || data.status}`);
    }

    // Map the predictions to our AddressSuggestion format
    return (data.predictions || []).map((prediction: GooglePlacesPrediction) => ({
      placeId: prediction.place_id,
      description: prediction.description,
    }));
  } catch (error) {
    console.error("Error fetching address suggestions:", error);
    throw error;
  }
}

/**
 * Get address details from Google Maps Places API
 */
export async function getAddressDetails({
  placeId,
}: PlaceDetailsRequest): Promise<AddressDetails> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  try {
    const params = new URLSearchParams({
      place_id: placeId,
      fields: "address_component,formatted_address",
      key: GOOGLE_MAPS_API_KEY,
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google Maps API error: ${errorData.error_message || response.statusText}`);
    }

    const data = await response.json() as GooglePlaceDetailsResponse;

    // Handle API error responses
    if (data.status !== "OK") {
      throw new Error(`Google Maps API error: ${data.error_message || data.status}`);
    }

    const result = data.result;
    
    // Default address details
    const addressDetails: AddressDetails = {
      address: result.formatted_address || "",
      city: "",
      zipCode: "",
      country: "",
    };

    // Extract address components
    result.address_components?.forEach((component: GoogleAddressComponent) => {
      const types = component.types;
      
      if (types.includes("locality")) {
        addressDetails.city = component.long_name;
      } else if (types.includes("postal_code")) {
        addressDetails.zipCode = component.long_name;
      } else if (types.includes("country")) {
        addressDetails.country = component.long_name;
      }
    });

    return addressDetails;
  } catch (error) {
    console.error("Error fetching address details:", error);
    throw error;
  }
} 