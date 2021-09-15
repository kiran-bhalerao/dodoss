use std::convert::TryInto;

use crate::{error::AppError, schema::dodo::Dodo};
use solana_program::{program_error::ProgramError, program_pack::Pack};

#[derive(Clone, Debug, PartialEq)]
pub enum AppInstruction {
    CreateDodo {
        title: String,
        content: String,
        state: u8,
        create_time: u32,
        update_time: u32,
    },
    UpdateDodo {
        state: u8,
        update_time: u32,
    },
}

impl AppInstruction {
    pub fn unpack(instruction: &[u8]) -> Result<Self, ProgramError> {
        // first byte is to determine the instruction
        // get the first byte from instruction data
        let (&tag, rest) = instruction
            .split_first()
            .ok_or(AppError::InvalidInstruction)?;

        Ok(match tag {
            0 => {
                // unpack binary data into Memo schema
                let Dodo {
                    title,
                    content,
                    state,
                    create_time,
                    update_time,
                } = Dodo::unpack(rest)?;

                Self::CreateDodo {
                    title,
                    content,
                    state,
                    create_time,
                    update_time,
                }
            }
            1 => {
                let state = rest
                    .get(..1)
                    .and_then(|slice| slice.try_into().ok())
                    .map(u8::from_le_bytes)
                    .ok_or(AppError::InvalidInstruction)?;

                let update_time = rest
                    .get((1)..(1 + 4))
                    .and_then(|slice| slice.try_into().ok())
                    .map(u32::from_le_bytes)
                    .ok_or(AppError::InvalidInstruction)?;

                Self::UpdateDodo { state, update_time }
            }
            _ => return Err(AppError::InvalidInstruction.into()),
        })
    }
}
