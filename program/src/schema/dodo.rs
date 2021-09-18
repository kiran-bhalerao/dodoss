use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use solana_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};

use crate::utils::convert_u8bytes_to_string;

//
// Define the data struct
//
#[derive(Clone, Debug, Default, PartialEq)]
pub struct Dodo {
    pub title: String,
    pub tagline: String,
    pub state: u8,
    pub create_time: u64,
    pub update_time: u64,
    pub creator: [u8; 32],
}

//
// Implement Sealed trait
//
impl Sealed for Dodo {}

//
// Implement IsInitialized trait
//
impl IsInitialized for Dodo {
    fn is_initialized(&self) -> bool {
        true
    }
}

pub const TITLE_LEN: usize = 124 * 4;
pub const TAGLINE_LEN: usize = 24 * 4;
pub const STATE_LEN: usize = 1;
pub const CREATE_TIME_LEN: usize = 8;
pub const UPDATE_TIME_LEN: usize = 8;
pub const CREATOR_LEN: usize = 1 * 32;

//
// Implement Pack trait
//
impl Pack for Dodo {
    // Fixed length
    const LEN: usize =
        TITLE_LEN + TAGLINE_LEN + STATE_LEN + CREATE_TIME_LEN + UPDATE_TIME_LEN + CREATOR_LEN;

    // Unpack data from [u8] to the data struct
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, Dodo::LEN];
        let (title, tagline, state, create_time, update_time, creator) = array_refs![
            src,
            TITLE_LEN,
            TAGLINE_LEN,
            STATE_LEN,
            CREATE_TIME_LEN,
            UPDATE_TIME_LEN,
            CREATOR_LEN
        ];

        let title_s: String = convert_u8bytes_to_string(title);
        let tagline_s: String = convert_u8bytes_to_string(tagline);
        let state_u = u8::from_le_bytes(*state);
        let create_time_u = u64::from_le_bytes(*create_time);
        let update_time_u = u64::from_le_bytes(*update_time);

        Ok(Dodo {
            title: title_s,
            tagline: tagline_s,
            state: state_u,
            create_time: create_time_u,
            update_time: update_time_u,
            creator: *creator,
        })
    }

    // Pack data from the data struct to [u8]
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, Dodo::LEN];
        let (dst_title, dst_tagline, dst_state, dst_create_time, dst_update_time, dst_creator) = mut_array_refs![
            dst,
            TITLE_LEN,
            TAGLINE_LEN,
            STATE_LEN,
            CREATE_TIME_LEN,
            UPDATE_TIME_LEN,
            CREATOR_LEN
        ];

        // Destructure a reference of self to get data to be packed
        let Dodo {
            title,
            tagline,
            state,
            create_time,
            update_time,
            creator,
        } = self;

        pack_string_to_char_bytes(&title, dst_title);
        pack_string_to_char_bytes(&tagline, dst_tagline);

        *dst_state = state.to_le_bytes();
        *dst_create_time = create_time.to_le_bytes();
        *dst_update_time = update_time.to_le_bytes();
        *dst_creator = *creator;
    }
}

fn pack_string_to_char_bytes(str: &String, dst: &mut [u8]) {
    let mut index = 0;
    for c in str.chars() {
        let char_str = c.to_string();
        let char_bytes = char_str.as_bytes();

        for i in 0..char_bytes.len() {
            dst[index + i] = char_bytes[i];
        }

        index += 4;
    }
}
